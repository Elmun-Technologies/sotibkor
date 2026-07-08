---
name: voice-test
description: Aisha.ai ovoz aylanasini (STT + TTS) sinash va latency o'lchash. Foydalanuvchi "ovozni test qil", "latency o'lcha", "aisha test", "voice test", "aylanani tekshir" desa yoki STT/TTS integratsiyasi o'zgargach ishlatiladi.
---

# Voice test — Aisha.ai aylanasini sinash

Ovoz aylanasini (mikrofon → STT → LLM → TTS → dinamik) sinash va latency o'lchash tartibi. Latency loyihaning kritik metrikasi: to'liq aylana **< 2 soniya**.

## Oldindan
- `.env.local` da `AISHA_API_KEY` va `ANTHROPIC_API_KEY` bo'lishi kerak (`.env.example` ga qara). Kalitlarni hech qachon logga chiqarma yoki commit qilma.
- `src/lib/aisha.ts` da real endpointlar sozlangan bo'lishi kerak (issue #1).

## Tartib

1. **Benchmark skriptini ishga tushir** (issue #5 da yoziladi):
   ```bash
   npm run bench:voice   # yoki: node scripts/bench-voice.mjs
   ```
   Skript namunaviy audio/matn bilan STT, LLM first-token va TTS bosqichlarini alohida va birgalikda o'lchaydi.

2. **Har bosqichni byudjetga solishtir** (`docs/ARCHITECTURE.md` §5):
   | Bosqich | Byudjet |
   |---------|---------|
   | STT | ~500 ms |
   | LLM first-token | ~400 ms |
   | TTS (birinchi chunk) | ~500 ms |
   | Jami (perceived) | < 2000 ms |

3. **Streaming ishlashini tekshir.** LLM javobi gap-gap oqim qilib TTS'ga uzatilyaptimi (butun javob kutilmayaptimi)? Birinchi gapdan TTS boshlanishigacha vaqtni o'lcha.

4. **Chegaradan oshsa** — qaysi bosqich sekin ekanini aniqla:
   - STT sekin → audio format/chunk hajmi, Aisha endpoint tanlovi.
   - LLM sekin → prompt uzunligi, streaming to'g'ri yoqilganmi, model tanlovi.
   - TTS sekin → matn bo'lakma hajmi, ovoz/format parametri.

5. **Natijani qayd et.** Latency raqamlarini PR/commit izohida ko'rsat. Regressiya bo'lsa (avvalgidan sekinlashsa) — sababini tushuntir.

## Muhim
- Kritik yo'lda og'ir sinxron ish (DB yozish, analitika) bo'lmasligini tekshir.
- Test real tarmoq sharoitida o'lchansin (localhost emas, mumkin bo'lsa).
- API kalitlari test loglarida ko'rinmasligini tekshir.

## Tekshiruv ro'yxati
- [ ] STT < ~500 ms.
- [ ] LLM first-token < ~400 ms, streaming ishlaydi.
- [ ] TTS birinchi chunk < ~500 ms.
- [ ] To'liq perceived aylana < 2000 ms.
- [ ] Kalitlar loglarda yo'q.
