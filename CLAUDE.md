# Sotuvchi Trainer

Sotuvchilar uchun ovozli AI trenajor: sotuvchi soha tanlaydi, AI mijoz rolini o'ynab (jaydari o'zbekchada otkaz beradi, manipulyatsiya qiladi), suhbat oxirida alohida LLM transkriptni rubrika bo'yicha baholaydi va aniq feedback beradi.

## Stack

- **Next.js 14** App Router + **TypeScript strict**
- **Supabase** (Postgres + Auth)
- **Aisha.ai** (`mo.aisha.group`) — o'zbek STT/TTS
- **Claude API** (`claude-sonnet`) — mijoz personasi + baholovchi
- **Tailwind + Framer Motion** — dark mode asosiy, neon aksentlar
- **Payme / Click** subscription (keyingi bosqichlarda)

## Ovoz aylanasi (kritik yo'l)

```
mikrofon → Aisha.ai STT → Claude API (persona, streaming) → Aisha.ai TTS → dinamik
```

To'liq aylana **< 2 soniya** bo'lishi shart. Byudjet: STT ~500ms, LLM first-token ~400ms, TTS ~500ms. Batafsil: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Qat'iy qoidalar

1. **i18n** — barcha UI matnlari i18n fayllarda (`uz` asosiy, `ru` keyinroq). Komponentga matn hardcode qilish **taqiqlanadi**.
2. **Promptlar** — barcha LLM promptlar FAQAT `/prompts` papkada `.md` fayl sifatida turadi. Kod ichiga (string literal) prompt yozish **taqiqlanadi**; kod promptni fayldan o'qiydi.
3. **API keylar** — faqat `.env` dan (`process.env`). Kodga, testga, commitga key yozish **taqiqlanadi**. `.env*` git'ga tushmaydi. `block-env-access.sh` hook `.env` o'qish/commitni bloklaydi.
4. **Latency** — STT+LLM+TTS aylanasi kritik metrika (< 2s). Har bir o'zgarish latency'ga ta'sirini hisobga oladi; og'ir sinxron ish kritik yo'lga qo'shilmaydi.
5. **Streaming** — LLM chaqiruvlar streaming ishlatadi. Birinchi to'liq gap tayyor bo'lishi bilan TTS'ga uzatiladi (butun javobni kutmaydi).
6. **Jaydari til** — persona promptlari kitobiy adabiy til ishlatmaydi. Qoidalar: [docs/PERSONAS.md](docs/PERSONAS.md#jaydari-til-qoidalari).
7. **Commit format** — `feat:` / `fix:` / `chore:` + qisqa tavsif (o'zbekcha yoki inglizcha).
8. **ROADMAP** — har katta feature'dan keyin [docs/ROADMAP.md](docs/ROADMAP.md) yangilanadi (holat belgilanadi).

## Struktura

```
CLAUDE.md              — shu fayl
.claude/               — skills, agents, hooks, settings
docs/                  — ARCHITECTURE, PERSONAS, SCORING, ROADMAP
prompts/personas/      — har persona alohida .md
prompts/scoring/       — baholovchi.md
src/app/               — Next.js sahifalar (App Router)
src/lib/               — aisha.ts (STT/TTS), llm.ts (Claude streaming), scoring.ts
.github/workflows/     — CI
```

## Hujjatlar

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — ovoz aylanasi, komponentlar, DB sxema, API route'lar, latency byudjeti
- [docs/PERSONAS.md](docs/PERSONAS.md) — 5 persona spetsifikatsiyasi + jaydari til qoidalari
- [docs/SCORING.md](docs/SCORING.md) — baholash rubrikasi + feedback JSON formati
- [docs/ROADMAP.md](docs/ROADMAP.md) — 6 bosqich reja

## Skills (`.claude/skills/`)

- **persona-yaratish** — yangi persona qo'shish
- **soha-qoshish** — yangi soha (mahsulot, otkazlar, seed) qo'shish
- **voice-test** — Aisha.ai aylanasini test + latency o'lchash
- **release-check** — deploy oldi checklist

## Ishlab chiqish

```bash
npm run dev        # dev server
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint
npm run build      # prod build
```

Env sozlash: `cp .env.example .env.local` va qiymatlarni to'ldir. `.env.local` hech qachon commit qilinmaydi.
