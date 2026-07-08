---
name: persona-yaratish
description: Sotuvchi Trainer'ga yangi AI mijoz personasi qo'shish. Foydalanuvchi "yangi persona", "persona qo'sh", "mijoz turi yarat" desa yoki mavjud 5 tadan tashqari yangi mijoz xarakteri kerak bo'lganda ishlatiladi.
---

# Yangi persona yaratish

Sotuvchi Trainer'ga yangi AI mijoz personasini qo'shish tartibi. Persona — jaydari o'zbekchada gapiradigan, sotuvchini sinaydigan mijoz.

## Tartib

1. **Spetsifikatsiyani aniqla.** `docs/PERSONAS.md` ni o'qi. Yangi persona uchun quyidagilarni yoz:
   - Xarakter tavsifi (bir paragraf: mijoz nimadan uradi, qanday to'siq qo'yadi).
   - 4–6 ta tipik otkaz (jaydari, real).
   - Qaysi sotuv texnikasi uni "ochadi".
   - Yumshash sharti (Level 1–2 / 3–5 / 6+ bo'yicha).

2. **Jaydari til qoidalariga rioya qil.** `docs/PERSONAS.md` dagi "Jaydari til qoidalari" bo'limini qayta o'qi:
   - Kitobiy adabiy til TAQIQLANADI.
   - Oddiy og'zaki: "aka", "obbo", "unaqami", "bo'ladimi shu", qisqa/chala gaplar.
   - Kontekstga bog'liq otkaz, robotdek takror emas.

3. **Prompt shablonidan foydalan.** Mavjud persona (masalan `prompts/personas/qimmatchi.md`) ni namuna sifatida ol. Prompt bloklari:
   - Rol ("sen mijozsan, roldan chiqma, AI ekaningni oshkor qilma").
   - Soha/mahsulot o'zgaruvchilari: `{{soha}}`, `{{mahsulot}}`.
   - Xarakter.
   - Jaydari til (majburiy).
   - Otkaz repertuari (kontekstga moslash ko'rsatmasi bilan).
   - Daraja mantig'i: `{{level}}`.
   - Muhim/chegara qoidalari.

4. **Saqlash.** Yangi faylni `prompts/personas/<nom>.md` ga yoz (nom — lotin, kichik harf, tire bilan; masalan `shoshqaloq.md`). Prompt kod ichiga YOZILMAYDI — faqat shu faylda.

5. **`docs/PERSONAS.md` ni yangila.** Yangi persona bo'limini qo'sh (raqamli ro'yxatga).

6. **Sinash.** `prompt-tester` subagentni chaqir: u persona promptini 8–10 xil sotuvchi javob stsenariysida o'ynab, persona xarakterdan chiqqan yoki kitobiy gapirgan joylarni hisobot qiladi. Muammolar bo'lsa promptni tuzat va qayta sina.

## Tekshiruv ro'yxati
- [ ] Prompt `prompts/personas/` da, kodga yozilmagan.
- [ ] Kitobiy til yo'q, jaydari til qoidalariga mos.
- [ ] `{{soha}}`, `{{mahsulot}}`, `{{level}}` o'zgaruvchilari bor.
- [ ] Daraja 1–2 / 3–5 / 6+ yumshash sharti aniq.
- [ ] `docs/PERSONAS.md` yangilandi.
- [ ] `prompt-tester` bilan sinaldi, hisobot yaxshi.
