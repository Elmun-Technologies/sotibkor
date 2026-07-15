/**
 * Aisha.ai STT/TTS klienti — o'zbek tili uchun.
 *
 * ⚠️ MUHIM — BASE_URL SIZDAN KELADI, HECH QANDAY TAXMIN QILINMAYDI:
 * Rasmiy Aisha hujjatiga (space.aisha.group) bu muhitdan kirib bo'lmadi
 * (tarmoq siyosati darajasida 403). Shu sabab bu klient hech qanday
 * server manzilini o'zi TAXMIN QILMAYDI — AISHA_BASE_URL majburiy env
 * o'zgaruvchisi, bo'lmasa aniq xato tashlanadi (pastga qarang). Bu API
 * kalitingiz va foydalanuvchi audiosi tasdiqlanmagan xostga jo'natilib
 * qolmasligi uchun ataylab shunday qilingan.
 *
 * So'rov/javob shakli (multipart STT, JSON TTS, auth header) UzbekVoice/
 * Mohir AI'ning OMMAVIY API pattern'iga asoslangan taxmin — real
 * AISHA_API_KEY va tasdiqlangan AISHA_BASE_URL bilan sinab ko'rish va
 * kerak bo'lsa moslashtirish kerak (pastdagi ENV o'zgaruvchilari orqali
 * kodni o'zgartirmasdan).
 *
 * Qat'iy qoidalar (CLAUDE.md):
 *  - AISHA_API_KEY faqat process.env dan (server-only, NEXT_PUBLIC_ EMAS).
 *  - Bu modul faqat server tomonda ishlatiladi (API route'lar).
 *  - Latency kritik: STT ~500ms, TTS birinchi chunk ~500ms byudjeti.
 */

function getBaseUrl(): string {
  const url = process.env.AISHA_BASE_URL;
  if (!url) {
    throw new Error(
      "AISHA_BASE_URL sozlanmagan. Rasmiy Aisha hujjatidan (yoki dashboard'dan) " +
        "haqiqiy API manzilini oling va muhit fayliga qo'shing — bu klient " +
        "hech qanday manzilni o'zi taxmin qilmaydi.",
    );
  }
  return url;
}
const STT_PATH = process.env.AISHA_STT_PATH ?? "/api/v1/stt";
const TTS_PATH = process.env.AISHA_TTS_PATH ?? "/api/v1/tts";
/** Auth sxemasi: "raw" (Authorization: <key>) yoki "bearer" (Authorization: Bearer <key>). */
const AUTH_SCHEME = (process.env.AISHA_AUTH_SCHEME ?? "raw").toLowerCase();
/** TTS uchun standart ovoz (agar akkauntda bir nechta ovoz bo'lsa). */
const DEFAULT_VOICE = process.env.AISHA_TTS_VOICE ?? "";

// Server tomonidagi deadline'lar: sekin/osilgan ulanish (VPN) route'ni ushlab
// qolmasin — belgilangan vaqtda javob kelmasa uzamiz, route 502 qaytaradi va
// klient darrov zaxira (Web Speech / matn) rejimiga o'tadi. Latency kritik yo'l.
const STT_TIMEOUT_MS = Number(process.env.AISHA_STT_TIMEOUT_MS) || 8000;
const TTS_TIMEOUT_MS = Number(process.env.AISHA_TTS_TIMEOUT_MS) || 4000;

/** `fetch`, lekin `timeoutMs` ichida javob kelmasa AbortController bilan uziladi. */
async function fetchDeadline(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  label: string,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error(`Aisha ${label} deadline (${timeoutMs}ms) oshib ketdi`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface SttRequest {
  audio: ArrayBuffer | Blob;
  mimeType: string;
  language?: string;
}

export interface SttResult {
  text: string;
  confidence?: number;
  latencyMs?: number;
}

export interface TtsRequest {
  text: string;
  voice?: string;
  format?: string;
}

export interface TtsResult {
  audio: ArrayBuffer;
  mimeType: string;
  latencyMs?: number;
}

function getApiKey(): string {
  const key = process.env.AISHA_API_KEY;
  if (!key) {
    throw new Error("AISHA_API_KEY sozlanmagan (muhit faylini tekshiring).");
  }
  return key;
}

function authHeader(): Record<string, string> {
  const key = getApiKey();
  return { Authorization: AUTH_SCHEME === "bearer" ? `Bearer ${key}` : key };
}

/** MIME turidan fayl kengaytmasini taxminlaydi (STT multipart uchun). */
function extFor(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  return "webm";
}

/**
 * Nutqni matnga (STT). O'zbek tili.
 * Taxmin qilingan shakl: POST {AISHA_BASE_URL}{STT_PATH}, multipart `file`,
 * `blocking=true` bilan sinxron javob { result: { text } }.
 */
export async function speechToText(req: SttRequest): Promise<SttResult> {
  const started = Date.now();
  const blob =
    req.audio instanceof Blob
      ? req.audio
      : new Blob([req.audio], { type: req.mimeType });

  const form = new FormData();
  form.append("file", blob, `audio.${extFor(req.mimeType)}`);
  form.append("blocking", "true"); // sinxron — voice loop javobni darrov kutadi
  form.append("return_offsets", "false");
  form.append("run_diarization", "false");
  if (req.language) form.append("language", req.language);

  const res = await fetchDeadline(
    `${getBaseUrl()}${STT_PATH}`,
    {
      method: "POST",
      headers: authHeader(), // multipart Content-Type'ni fetch o'zi qo'yadi
      body: form,
    },
    STT_TIMEOUT_MS,
    "STT",
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Aisha STT xatosi (${res.status}): ${detail.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    result?: { text?: string; conf?: number };
    text?: string;
  };
  // Ikkala mumkin bo'lgan shakl: { result: { text } } yoki { text }.
  const text = data.result?.text ?? data.text ?? "";
  return {
    text,
    confidence: data.result?.conf,
    latencyMs: Date.now() - started,
  };
}

/**
 * Matnni nutqqa (TTS). Streaming pipeline'da bir gap/bo'lak uzatiladi.
 * Taxmin qilingan shakl: POST {AISHA_BASE_URL}{TTS_PATH} JSON { text, voice? }
 * -> audio baytlari. (Agar sizning API job-asosli URL qaytarsa — bu
 * funksiyani moslashtiramiz.)
 */
export async function textToSpeech(req: TtsRequest): Promise<TtsResult> {
  const started = Date.now();
  const voice = req.voice ?? DEFAULT_VOICE;

  const res = await fetchDeadline(
    `${getBaseUrl()}${TTS_PATH}`,
    {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text: req.text,
        ...(voice ? { voice } : {}),
      }),
    },
    TTS_TIMEOUT_MS,
    "TTS",
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Aisha TTS xatosi (${res.status}): ${detail.slice(0, 300)}`,
    );
  }

  const mimeType = res.headers.get("Content-Type") ?? "audio/mpeg";

  // Agar javob JSON bo'lsa (audio URL yoki base64), uni yuklab olamiz/dekodlaymiz.
  if (mimeType.includes("application/json")) {
    const data = (await res.json()) as {
      url?: string;
      audio?: string; // base64 bo'lishi mumkin
      result?: { url?: string; audio?: string };
    };
    const url = data.url ?? data.result?.url;
    if (url) {
      const audioRes = await fetchDeadline(
        url,
        {},
        TTS_TIMEOUT_MS,
        "TTS-audio",
      );
      const buf = await audioRes.arrayBuffer();
      return {
        audio: buf,
        mimeType: audioRes.headers.get("Content-Type") ?? "audio/mpeg",
        latencyMs: Date.now() - started,
      };
    }
    const b64 = data.audio ?? data.result?.audio;
    if (b64) {
      const buf = Buffer.from(b64, "base64");
      return {
        audio: buf.buffer.slice(
          buf.byteOffset,
          buf.byteOffset + buf.byteLength,
        ) as ArrayBuffer,
        mimeType: "audio/mpeg",
        latencyMs: Date.now() - started,
      };
    }
    throw new Error("Aisha TTS: javobda audio (url/base64) topilmadi.");
  }

  // To'g'ridan-to'g'ri audio baytlari.
  const audio = await res.arrayBuffer();
  return { audio, mimeType, latencyMs: Date.now() - started };
}
