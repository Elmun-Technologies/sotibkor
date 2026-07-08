---
name: soha-qoshish
description: Sotuvchi Trainer'ga yangi soha (bank, telekom, ta'lim, mebel/texnika kabi) qo'shish. Foydalanuvchi "yangi soha", "soha qo'sh", "bu sohani qo'sh" desa yoki mavjud sohalardan tashqari yangi mahsulot yo'nalishi kerak bo'lganda ishlatiladi.
---

# Yangi soha qo'shish

Sotuvchi Trainer'ga yangi sotuv sohasini qo'shish tartibi. Soha — mahsulot ma'lumoti, otkazlar va skript-shpargalka to'plami; personalar shu soha kontekstida gaplashadi.

## Tartib

1. **Mahsulot ma'lumotini yig'.** Yangi soha uchun:
   - Soha nomi va kaliti (masalan `bank`, `telekom`, `talim`, `mebel`).
   - 1–3 ta tipik mahsulot/xizmat (persona `{{mahsulot}}` sifatida ishlatadi).
   - Narx diapazoni, asosiy foydalar, raqobat konteksti.
   - Kafolat / shartlar (Shubhali persona uchun muhim).

2. **15–20 ta tipik otkazni yoz.** Real, jaydari o'zbekchada. Bu otkazlar personalar repertuarini boyitadi. Har xil turdagi otkazlar:
   - Narx ("qimmat", "arzonroq bor").
   - Ishonch ("kafolat bormi", "original mi").
   - Vaqt/e'tibor ("keyin", "bandman").
   - Ehtiyoj ("kerak emas", "bor allaqachon").
   - Qaror ("o'ylab ko'ramiz", "maslahatlashay").

3. **Skript-shpargalka tayyorla.** Sotuvchi uchun bu sohada ishlaydigan namunaviy javoblar/texnikalar (qiymat framing, dalil, closing namunalari). Bu baholovchi va o'quv materiali uchun ishlatiladi.

4. **Seed data yoz.** Soha ma'lumotini strukturaviy formatda saqla:
   - `prompts/personas/` promptlaridagi `{{soha}}`/`{{mahsulot}}` bilan mos.
   - Kelajakda Supabase seed (masalan `supabase/seed/<soha>.json` yoki DB migratsiya) — mahsulot, otkazlar, skript.
   - i18n: soha nomi va UI matnlari i18n faylida (hardcode YO'Q).

5. **Personalar bilan bog'lash.** 5 persona ham yangi sohada gaplasha olishini tekshir (soha/mahsulot o'zgaruvchilari to'g'ri uzatilishini). Kerak bo'lsa `voice-test` bilan sinab ko'r.

## Tekshiruv ro'yxati
- [ ] Mahsulot ma'lumoti (narx, foyda, kafolat) yig'ilgan.
- [ ] 15–20 tipik otkaz, jaydari, xilma-xil turlar.
- [ ] Skript-shpargalka tayyor.
- [ ] Seed data strukturaviy formatda.
- [ ] Soha nomi/UI matnlari i18n da, hardcode yo'q.
- [ ] `docs/ROADMAP.md` 4-bosqichi yangilandi.
