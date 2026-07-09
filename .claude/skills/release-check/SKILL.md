---
name: release-check
description: Deploy oldi tekshiruv ro'yxati (build, tsc, env, latency, i18n). Foydalanuvchi "release", "deploy oldi", "chiqarishga tayyormi", "release check" desa yoki prod deploy oldidan ishlatiladi.
---

# Release check — deploy oldi checklist

Prod'ga chiqarishdan oldin barcha kritik tekshiruvlar. Har bandni tartib bilan bajar; birortasi yiqilsa — deploy qilma.

## 1. Build va tiplar

```bash
npm run typecheck   # tsc --noEmit — strict, 0 xato
npm run lint        # eslint — 0 xato
npm run build       # next build — muvaffaqiyatli
```

Uchalasi ham toza o'tishi shart.

## 2. Environment o'zgaruvchilari

- `.env.example` dagi barcha kalitlar prod muhitida (Vercel/hosting) sozlanganmi:
  - `AISHA_API_KEY`, `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
  - `PAYME_*`, `CLICK_*` (subscription bosqichida)
- Kalitlar kodga yoki repoga sizib chiqmaganmi (`block-env-access` hook, `code-reviewer` agent tekshiradi).
- `.env*` `.gitignore` da.

## 3. Latency benchmark

- `voice-test` skili orqali ovoz aylanasini o'lcha.
- To'liq aylana < 2000 ms (STT ~500, LLM first-token ~400, TTS ~500).
- Oxirgi releasdan regressiya yo'q.

## 4. i18n to'liqligi

- Barcha UI matnlari i18n faylida (`uz` asosiy). Hardcode matn yo'q.
- `uz` fayl to'liq — bo'sh yoki yetishmaydigan kalit yo'q.
- (`ru` qo'shilgan bo'lsa) `ru` fayl `uz` bilan mos kalitlarga ega.

## 5. Xavfsizlik

- `code-reviewer` agent bilan oxirgi diff'ni tekshir: API key sizishi, latency zarari, i18n hardcode.
- Server-only kalitlar (`AISHA_API_KEY`, `SUPABASE_SERVICE_KEY`) `NEXT_PUBLIC_` prefiksiz — brauzerga chiqmaydi.

## 6. Ma'lumotlar bazasi

- Supabase migratsiyalar prod'ga qo'llanganmi.
- RLS (Row Level Security) siyosatlari yoqilganmi.

## Yakuniy tekshiruv ro'yxati

- [ ] typecheck / lint / build — toza.
- [ ] Barcha env varlar prod'da sozlangan, sizish yo'q.
- [ ] Latency < 2s, regressiya yo'q.
- [ ] i18n to'liq, hardcode yo'q.
- [ ] code-reviewer o'tdi.
- [ ] DB migratsiya + RLS tayyor.
- [ ] `docs/ROADMAP.md` yangilandi.
