/**
 * Aisha.ai (mo.aisha.group) STT/TTS klienti — o'zbek tili uchun.
 *
 * ⚠️ SKELETON: Aisha.ai API'ning aniq endpoint va so'rov/javob formati bu yerda
 * TAXMIN QILINMAYDI. Real integratsiya issue #1 doirasida, rasmiy hujjatlarga
 * qarab qilinadi. Quyida faqat interfeys va TODO'lar.
 *
 * Qat'iy qoidalar (CLAUDE.md):
 *  - AISHA_API_KEY faqat process.env dan (server-only, NEXT_PUBLIC_ EMAS).
 *  - Bu modul faqat server tomonda ishlatiladi (API route'lar).
 *  - Latency kritik: STT ~500ms, TTS birinchi chunk ~500ms byudjeti.
 */

const AISHA_BASE_URL = "https://mo.aisha.group"; // TODO(#1): rasmiy hujjatdan tasdiqlash

/** Aisha STT'ga yuboriladigan audio formati. TODO(#1): qo'llab-quvvatlanadigan formatni aniqlash. */
export interface SttRequest {
  /** Xom audio (masalan webm/opus yoki wav). */
  audio: ArrayBuffer | Blob;
  /** MIME turi, masalan "audio/webm". */
  mimeType: string;
  /** Til kodi. O'zbek uchun. TODO(#1): aniq kod ("uz" | "uz-UZ" | ...). */
  language?: string;
}

export interface SttResult {
  /** Tanib olingan matn. */
  text: string;
  /** Ishonch darajasi (0..1), agar API qaytarsa. */
  confidence?: number;
  /** O'lchangan latency (ms) — benchmark uchun. */
  latencyMs?: number;
}

/** Aisha TTS so'rovi. */
export interface TtsRequest {
  /** Ovozga aylantiriladigan matn (bir gap yoki bo'lak — streaming uchun qisqa). */
  text: string;
  /** Ovoz identifikatori. TODO(#1): mavjud ovozlar ro'yxati. */
  voice?: string;
  /** Chiqish audio formati. TODO(#1): qo'llab-quvvatlanadigan format. */
  format?: string;
}

export interface TtsResult {
  /** Sintez qilingan audio. */
  audio: ArrayBuffer;
  mimeType: string;
  latencyMs?: number;
}

function getApiKey(): string {
  const key = process.env.AISHA_API_KEY;
  if (!key) {
    throw new Error("AISHA_API_KEY sozlanmagan (.env.local ni tekshiring).");
  }
  return key;
}

/**
 * Nutqni matnga (STT). O'zbek tili.
 * TODO(#1): real endpoint, autentifikatsiya sxemasi, multipart/binary format,
 * xatoliklarni qayta ishlash, latencyMs o'lchash.
 */
export async function speechToText(_req: SttRequest): Promise<SttResult> {
  getApiKey();
  void AISHA_BASE_URL;
  throw new Error(
    "TODO(#1): Aisha STT integratsiyasi hali qilinmagan. Rasmiy mo.aisha.group hujjatiga qarang.",
  );
}

/**
 * Matnni nutqqa (TTS). Streaming pipeline'da bir gap/bo'lak uzatiladi.
 * TODO(#1): real endpoint, chunked/stream javob, birinchi chunk latency o'lchash.
 */
export async function textToSpeech(_req: TtsRequest): Promise<TtsResult> {
  getApiKey();
  throw new Error(
    "TODO(#1): Aisha TTS integratsiyasi hali qilinmagan. Rasmiy mo.aisha.group hujjatiga qarang.",
  );
}
