# SCORING

Suhbat tugagach, alohida LLM chaqiruvi ("baholovchi") to'liq transkriptni oladi va rubrika bo'yicha baholaydi. Baholovchi prompti: `prompts/scoring/baholovchi.md`.

Maqsad — sof ball emas, **o'stiruvchi feedback**: sotuvchi aniq nimani xato qildi va qanday desa yaxshi bo'lardi.

## Rubrika (jami 100 ball)

| Bo'lim                               | Ball | Nima baholanadi                                                                                      |
| ------------------------------------ | ---- | ---------------------------------------------------------------------------------------------------- |
| **Salomlashish va tanishtirish**     | 10   | O'zini/kompaniyani tanishtirdimi, iliq ochilishmi, ohang.                                            |
| **Ehtiyoj aniqlash**                 | 20   | Savol berdimi yoki darrov maqtay boshladimi? Mijozni tingladimi, ehtiyojni ochdimi?                  |
| **Otkazlarga ishlov berish**         | 30   | Otkazni inkor qilmasdan tan oldimi, qiymat/dalil bilan javob berdimi, darrov chegirmaga yugurmadimi? |
| **Yopishga harakat (closing)**       | 20   | Aniq keyingi qadam / qaror so'radimi? "O'ylab ko'ramiz"ni ishga soldimi?                             |
| **Ohang, ishonch, gapni bo'lmaslik** | 20   | Ishonchli, hurmatli, mijozni bo'lmadimi, bosim qilmadimi?                                            |

### Bo'lim ichidagi mezonlar (baholovchiga yo'riqnoma)

**Ehtiyoj aniqlash (20):** kamida 1 ochiq savol = +8; mijoz javobiga moslashish = +7; darrov maqtash/pitch = jarima.

**Otkazlarga ishlov (30):** har otkaz uchun — tan olish (acknowledge) + qiymat/dalil + qayta yo'naltirish. "Qimmat" deganda darrov chegirma = katta jarima (avval qiymat kerak). Otkazni e'tiborsiz qoldirish = 0.

**Closing (20):** aniq call-to-action bor = +12; yashirin e'tirozni ochish = +8. Umuman closing yo'q = 0.

## Muhim tamoyillar

1. **Sotmaslik ≠ 0 ball.** Sotuvchi sotolmasa ham, yaxshi gaplashsa, to'g'ri texnika ishlatgan bo'lsa — ball oladi. Mag'lubiyat motivatsiyani o'ldirmasligi kerak.
2. **Aniq iqtibos.** Har xato transkriptdan aniq iqtibos bilan ko'rsatiladi ("mijoz 'qimmat' deganda sen 'mayli 400 qilaman' deding").
3. **Namuna bilan.** Har xato uchun "bunday desang yaxshi bo'lardi" muqobil formulirovka beriladi.
4. **Kuchli tomon ham.** 1–2 ta yaxshi qilingan narsa ta'kidlanadi (nima to'g'ri edi).
5. **Jaydari, do'stona ton.** Feedback ham murabbiy kabi — o'zbekcha, aniq, kamsitmasdan.

## Feedback formati (JSON)

Baholovchi FAQAT quyidagi JSON'ni qaytaradi (boshqa matn yo'q):

```json
{
  "total": 72,
  "breakdown": {
    "salomlashish": 8,
    "ehtiyoj_aniqlash": 14,
    "otkazlarga_ishlov": 20,
    "closing": 12,
    "ohang": 18
  },
  "mistakes": [
    {
      "quote": "Mijoz 'qimmat' deganda: 'mayli senga 400 qilaman'",
      "why": "Darrov chegirma taklif qilding. Bu qiymatni pasaytiradi va mijoz yana tortishadi.",
      "better": "Avval qiymatni tushuntirish kerak edi: 'narxi shu, chunki kafolat 2 yil va bepul yetkazish. Kuniga 1000 so'mdan ham kam chiqadi.'"
    },
    {
      "quote": "Suhbat boshida: 'bizda zo'r telefonlar bor, oling'",
      "why": "Ehtiyoj so'ramasdan darrov pitch qilding.",
      "better": "'Aka, o'zingizga qidiryapsizmi yoki sovg'agami? Nima muhim siz uchun — kamera, batareya?'"
    }
  ],
  "strengths": [
    "Ohangi ishonchli va hurmatli edi, mijozni bo'lmading.",
    "Kafolat haqida aniq ma'lumot berding."
  ],
  "closed": true,
  "xp_awarded": 90
}
```

### Maydonlar

| Maydon       | Tur         | Izoh                                                                                                                                                 |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `total`      | int 0–100   | bo'lim ballari yig'indisi                                                                                                                            |
| `breakdown`  | object      | har bo'lim bo'yicha ball (kalitlar yuqoridagidek)                                                                                                    |
| `mistakes`   | array (2–3) | `{quote, why, better}` — aniq xato + namuna                                                                                                          |
| `strengths`  | array (1–2) | to'g'ri qilingan narsalar                                                                                                                            |
| `closed`     | bool        | mijoz sotib olishga rozi bo'ldimi                                                                                                                    |
| `xp_awarded` | int         | modelning taxmini (pastdagi formula) — server `total`/`closed`/level asosida qayta hisoblab, ustidan yozadi (`src/lib/gamification.ts` `xpForScore`) |

## XP formulasi

Yagona manba: `src/lib/gamification.ts` `xpForScore()`. Modeldan so'ralgan taxmin ham xuddi shu formulaga amal qiladi (drift bo'lmasin uchun), lekin yakuniy qiymat har doim serverda qayta hisoblanadi — modelning arifmetikasiga ishonilmaydi:

```
xp_awarded = round(total * 1.0)
           + (yopildi ? 50 : 0)          // sotib olishga rozi qildimi
           + (persona_level >= 6 ? 30 : 0) // qiyin persona bonusi
```

Level chegaralari (`users.level`): Stajyor → Sotuvchi → Katta sotuvchi → Menejer → Sales Master. Aniq XP chegaralari `docs/ROADMAP.md` 3-bosqichda belgilanadi.

## Validatsiya

`src/lib/scoring.ts` baholovchi JSON'ini parse qiladi va sxema bo'yicha tekshiradi:

- `total` = `breakdown` yig'indisiga teng (±1 tolerantlik).
- `mistakes` da har element uchta maydonga ega.
- Noto'g'ri JSON qaytsa — bir marta qayta so'raladi (retry), keyin xato loglanadi.
