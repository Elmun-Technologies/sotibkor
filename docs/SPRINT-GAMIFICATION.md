# SPRINT — Gamifikatsiya + Sayqal UI

Bu hujjat ROADMAP 3-bosqich ("Gamification + UI") uchun sprint rejasi.
Maqsad — foydalanuvchi o'z o'sishini ko'radigan, qaytib kelishga motivatsiya beradigan
gamifikatsiya tizimi (XP, daraja, streak, leaderboard, achievements, progress-xarita)
va butun mahsulotni sayqallagan, dark + neon (light ham to'liq ishlaydigan) UI qatlami.

Sprint muddati: **3 hafta**. Ish 8 rolga taqsimlangan (2 frontend, 3 backend, security,
tester, production). Rollar parallel ishlaydi; integratsiya rejasi 5-bo'limda.

---

## 0. Qat'iy qoidalar (har rol uchun majburiy)

Bu qoidalar CLAUDE.md dan keladi va sprint davomida **buzilmaydi**:

1. **i18n** — barcha UI matnlari `src/i18n/uz.json` da. Komponentga matn hardcode qilish taqiqlanadi.
   Yangi bo'limlar: `gamifikatsiya.*`, `leaderboard.*`, `achievements.*`, `daraja.*`.
2. **Promptlar** — LLM prompt kerak bo'lsa FAQAT `/prompts` papkada `.md` fayl. (Bu sprintda
   yangi LLM prompt kutilmaydi; kerak bo'lsa `/prompts` ga qo'shiladi.)
3. **API kalitlar** — faqat `process.env` (server-only). `NEXT_PUBLIC_*` faqat public qiymat uchun.
   `SUPABASE_SERVICE_KEY`, `OPENAI_API_KEY`, `AISHA_API_KEY` brauzerga chiqmaydi.
4. **Latency** — ovoz aylanasi (STT→LLM→TTS) yo'liga og'ir sinxron ish qo'shilmaydi.
   XP hisoblash, DB yozish, leaderboard yangilash — suhbatdan keyin yoki fonda.
5. **Streaming** — mavjud `/api/chat` oqim mantig'i buzilmaydi.
6. **TypeScript strict** — `any` dan qochiladi; har fayl toza `tsc --noEmit` bo'ladi.
7. **Dizayn** — dark asosiy + neon, LEKIN light theme token asosida to'liq ishlaydi.

---

## 1. Maqsad va natija (Definition of Done)

**Maqsad:** suhbat tugagach foydalanuvchi XP oladi, darajasi o'sadi, streak yuritadi,
leaderboardda o'z o'rnini ko'radi, achievements ochadi va progress-xaritada yo'lini kuzatadi.
Butun UI (bosh sahifa, `/trener`, natija, yangi `/profil` va `/leaderboard`) sayqallangan,
animatsiyali, dark/light da bir xil ishlaydi.

**Sprint yakuni mezoni (umumiy):**

- [ ] Suhbat tugagach XP hisoblanadi, daraja va streak yangilanadi (fonda, latency'ga ta'sirsiz).
- [ ] Leaderboard (haftalik) sahifasi ishlaydi va real ma'lumot ko'rsatadi.
- [ ] Kamida 6 ta achievement aniqlanadi va ochilishi ishlaydi.
- [ ] Progress-xarita (typing-club uslubi) foydalanuvchi bosqichini ko'rsatadi.
- [ ] Dark va light theme'da barcha yangi ekranlar toza ko'rinadi (token asosida).
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` toza.
- [ ] Barcha UI matni i18n'da; kodda hardcode matn yo'q.
- [ ] Security review o'tgan (server/client chegarasi, RLS, kalitlar).

---

## 2. Umumiy dizayn qarorlari (shared contract)

Rollar bir-biriga bog'liq bo'lgani uchun quyidagi shartnoma **birinchi kun** kelishiladi
va o'zgarmaydi (o'zgarsa — hammaga xabar):

### 2.1. Daraja modeli

| Daraja | Nom (i18n `daraja.*`) | XP chegarasi |
| ------ | --------------------- | ------------ |
| 1      | Stajyor               | 0            |
| 2      | Sotuvchi              | 500          |
| 3      | Katta sotuvchi        | 1500         |
| 4      | Menejer               | 3500         |
| 5      | Sales Master          | 7000         |

Chegaralar `src/lib/gamification.ts` da bitta manba (single source of truth) sifatida turadi.
SCORING.md dagi daraja nomlari bilan mos.

### 2.2. XP formulasi (SCORING.md draftini yakunlaydi)

```
xp = round(total * 1.0)
   + (yopildi ? 50 : 0)
   + (persona_level >= 6 ? 30 : 0)
   + streak_bonus            // streak_days >= 3 bo'lsa +10, >=7 bo'lsa +25
```

Formula FAQAT `src/lib/gamification.ts` da; UI va API undan foydalanadi.

### 2.3. Streak qoidasi

Ketma-ket kunlarda kamida 1 suhbat = streak +1. Bir kun o'tkazib yuborilsa — 0 ga tushadi.
Kun chegarasi Toshkent vaqti (Asia/Tashkent) bo'yicha.

### 2.4. Achievement kodlari (dastlabki ro'yxat)

`first_conversation`, `first_close`, `streak_3`, `streak_7`, `score_90`, `hard_persona_win`.
Har biri `code`, i18n nomi (`achievements.<code>.title` / `.desc`), ikonka nomi.

### 2.5. API kontrakti (frontend ↔ backend)

| Route                  | Metod | Javob (qisqacha)                                                           |
| ---------------------- | ----- | -------------------------------------------------------------------------- |
| `/api/session`         | POST  | `{ sessionId }` — suhbat boshlanishi (yakunda XP/streak fonda hisoblanadi) |
| `/api/gamification/me` | GET   | `{ xp, level, nextLevelXp, streakDays, achievements[] }`                   |
| `/api/leaderboard`     | GET   | `{ week, entries: [{ rank, name, xpWeek, isMe }] }`                        |

TypeScript tiplar `src/lib/gamification.ts` (yoki `src/lib/types.ts`) da eksport qilinadi va
frontend/backend bir xil tipdan foydalanadi.

---

## 3. Ish taqsimoti va acceptance mezonlari

### Rol A — Frontend 1: Gamifikatsiya ekranlari (XP, daraja, streak, progress-xarita)

**Vazifa:** foydalanuvchi o'sishini ko'rsatadigan vizual komponentlar.

Ishlar:

- `/profil` sahifasi: XP bar, joriy daraja + keyingi darajagacha progress, streak counter.
- Natija sahifasiga (`/trener` yakuni yoki natija ekrani) "XP oldingiz +N", daraja ko'tarilsa
  "yangi daraja!" animatsiyasi (Framer Motion).
- Progress-xarita komponenti (typing-club uslubi): bosqichlar/darslar tugmalari, ochilgan/qulflangan holat.
- Barcha komponentlar `src/i18n/uz.json` (`gamifikatsiya.*`, `daraja.*`) dan matn oladi.

**Acceptance mezonlari:**

- [ ] `/profil` da XP, daraja, keyingi darajagacha % va streak `/api/gamification/me` dan keladi (mock fallback bilan).
- [ ] XP bar va daraja rangi dizayn tokenlaridan; dark va light da to'g'ri.
- [ ] Daraja ko'tarilganda animatsiya faqat bir marta ishlaydi (takror render'da qaytmaydi).
- [ ] Progress-xarita responsive (mobil + desktop), qulflangan bosqich bosilmaydi.
- [ ] Hech qanday hardcode matn yo'q; `tsc` va `lint` toza.
- [ ] Kalitsiz (mock) rejimda ham chiroyli ma'lumot ko'rsatiladi.

### Rol B — Frontend 2: Leaderboard, achievements, dizayn tokenlari va animatsiya qatlami

**Vazifa:** ijtimoiy/motivatsion ekranlar + butun UI ni sayqallaydigan dizayn tizimi.

Ishlar:

- `/leaderboard` sahifasi: haftalik reyting jadvali, o'z qatorini ajratib ko'rsatish (`isMe`).
- Achievements gridi (`/profil` ichida yoki alohida): ochilgan/qulflangan kartalar, tooltip.
- Dizayn tokenlari: `globals.css` da CSS o'zgaruvchilari (neon aksent, sirt, matn ranglari)
  dark va light uchun; barcha yangi komponentlar shu tokenlardan foydalanadi.
- Umumiy animatsiya qoidalari (Framer Motion variantlari): kartalar, badge'lar, hover.
- i18n: `leaderboard.*`, `achievements.*`.

**Acceptance mezonlari:**

- [ ] `/leaderboard` `/api/leaderboard` dan ma'lumot oladi, o'z qatorim ajralib turadi.
- [ ] Achievement kartalari 6+ kodni ko'rsatadi; qulflangani kulrang, ochilgani neon.
- [ ] Light theme'ga o'tganda hech bir matn/ikonka ko'rinmay qolmaydi (kontrast yetarli).
- [ ] Animatsiyalar `prefers-reduced-motion` ni hurmat qiladi.
- [ ] Barcha matn i18n'dan; `tsc` va `lint` toza; mock fallback ishlaydi.

### Rol C — Backend 1: Gamifikatsiya mantiq qatlami (`src/lib/gamification.ts`)

**Vazifa:** XP, daraja, streak, achievement — sof, testlanadigan mantiq (DB'siz).

Ishlar:

- `src/lib/gamification.ts`: `computeXp(score, opts)`, `levelForXp(xp)`, `nextLevel(xp)`,
  `updateStreak(prevStreak, lastDate, now)`, `evaluateAchievements(context)`.
- Daraja jadvali va achievement ro'yxati shu faylda (single source of truth).
- Barcha funksiyalar sof (pure), tiplar aniq eksport qilinadi (frontend ham ishlatadi).

**Acceptance mezonlari:**

- [ ] Funksiyalar sof: bir xil kirishga bir xil chiqish, DB/Date global chaqiruvi yo'q (`now` parametr).
- [ ] `levelForXp` chegaralarda to'g'ri (masalan 500 XP → 2-daraja).
- [ ] `updateStreak` ketma-ket kun +1, o'tkazib yuborilgan kun 0, o'sha kun takror = o'zgarmas.
- [ ] `any` yo'q; tiplar eksport; `tsc` toza.
- [ ] Tester uchun sof funksiyalar unit-testga tayyor (2.2/2.3 misollari bilan mos).

### Rol D — Backend 2: API route'lar (`/api/gamification/me`, `/api/leaderboard`, `/api/session` yakuni)

**Vazifa:** frontend uchun ma'lumot beruvchi server route'lar; suhbat yakunida XP yozish.

Ishlar:

- `GET /api/gamification/me` — joriy foydalanuvchi XP/daraja/streak/achievements.
- `GET /api/leaderboard` — haftalik reyting (hafta boshi = dushanba, Asia/Tashkent).
- `/api/session` yakuni yoki `/api/score` dan keyin: XP/streak/achievement **fonda** yoziladi
  (`waitUntil` yoki javobdan keyin), ovoz aylanasiga bloklovchi ish qo'shmaydi.
- Kalitsiz rejimda deterministik mock javob (frontend'ni bloklamaslik uchun).

**Acceptance mezonlari:**

- [ ] Route'lar `src/lib/gamification.ts` dan foydalanadi (mantiqni qayta yozmaydi).
- [ ] XP yozish suhbat javob vaqtini bloklamaydi (fonda; latency byudjetiga ta'sir yo'q).
- [ ] Server-only kalitlar (`SUPABASE_SERVICE_KEY`) faqat route ichida; javobda chiqmaydi.
- [ ] Supabase sozlanmagan bo'lsa mock ma'lumot qaytaradi (500 emas).
- [ ] Javob tiplari 2.5 kontraktiga mos; `tsc` toza.

### Rol E — Backend 3: Ma'lumotlar bazasi (migratsiyalar + Supabase qatlami)

**Vazifa:** ARCHITECTURE.md sxemasini (users XP maydonlari, leaderboard, achievements) real qilish.

Ishlar:

- Migratsiya SQL'lari: `users` (xp, level, streak_days, last_session_date), `leaderboard`,
  `achievements` jadvallari (ARCHITECTURE.md draftiga mos).
- Supabase server klient qatlami (`src/lib/db.ts` yoki mavjud config'ga qo'shimcha) —
  faqat server tomonda, `SUPABASE_SERVICE_KEY` bilan.
- Haftalik leaderboard yangilash strategiyasi (view yoki cron; dastlab so'rovda hisoblash mumkin).
- Barcha jadvalga RLS (Row Level Security) siyosati loyihasi (Security roli bilan kelishiladi).

**Acceptance mezonlari:**

- [ ] Migratsiya fayllari toza qo'llaniladi; sxema ARCHITECTURE.md bilan mos.
- [ ] DB klient FAQAT server modullarida import qilinadi (client bundle'ga tushmaydi).
- [ ] Har jadvalga RLS yoqilgan; foydalanuvchi faqat o'z ma'lumotini o'qiydi/yozadi.
- [ ] Leaderboard so'rovi haftani Asia/Tashkent bo'yicha to'g'ri kesadi.
- [ ] Sxema uchun tiplar Backend 1/2 tiplariga mos; `tsc` toza.

### Rol F — Security

**Vazifa:** sprint chegarasidagi xavfsizlikni ta'minlash.

Ishlar:

- Server/client chegarasi audit: hech bir server-only kalit `NEXT_PUBLIC_*` yoki client komponentga o'tmasligi.
- Supabase RLS siyosatlarini ko'rib chiqish (foydalanuvchi boshqaning XP/achievementini o'zgartira olmaydi).
- Leaderboardda PII: faqat ism/taxallus ko'rsatiladi, email/ID chiqmaydi.
- XP yozish endpointida spoofing himoyasi (client XP ni o'zi belgilay olmaydi; server hisoblaydi).
- `block-env-access.sh` hook va `.env` qoidalari saqlanganini tekshirish.

**Acceptance mezonlari:**

- [ ] Server-only kalitlar client bundle'da yo'q (build chiqishida grep bilan tekshirilgan).
- [ ] Har DB jadvalida RLS bor va test bilan tasdiqlangan (boshqa userga yozib bo'lmaydi).
- [ ] XP/achievement faqat server hisobidan; client yuborgan XP qiymati e'tiborsiz qoldiriladi.
- [ ] Leaderboard javobida PII (email, uuid) yo'q.
- [ ] Security checklist to'ldirilgan va sprint yakunida imzolangan.

### Rol G — Tester

**Vazifa:** mantiq va oqimlarni tekshirish, regressiyani ushlash.

Ishlar:

- `src/lib/gamification.ts` sof funksiyalari uchun unit-testlar (XP, daraja chegaralari, streak).
- API route'lar uchun kontrakt testlari (mock rejimda 200 va to'g'ri shakl).
- Latency regressiya tekshiruvi: `npm run bench:voice` — XP/DB fonda ekani, aylana < 2s saqlanganini.
- i18n tekshiruvi: yangi komponentlarda hardcode matn yo'qligini (grep/lint).
- Dark/light vizual smoke: har yangi sahifa ikkala theme'da ochiladi.

**Acceptance mezonlari:**

- [ ] Gamification mantig'i uchun unit-testlar yashil; chegaralar (500/1500/…) qamrab olingan.
- [ ] API route testlari mock rejimda o'tadi (500 yo'q).
- [ ] `bench:voice` natijasi: gamifikatsiya qo'shilgandan keyin ham aylana byudjet ichida.
- [ ] Hardcode matn tekshiruvi toza; light theme'da ko'rinmas element yo'q.
- [ ] Test hisoboti sprint yakunida taqdim etiladi.

### Rol H — Production (release / DevOps)

**Vazifa:** deploy tayyorligi va monitoring.

Ishlar:

- `.env.example` ni yangilash (yangi env kerak bo'lsa: Supabase URL/KEY — server-only).
- `release-check` skili bo'yicha checklist: `typecheck` + `lint` + `build` + env + latency + i18n.
- CI (`.github/workflows`) da yangi route/testlar qamrab olinganini ta'minlash.
- Migratsiyalarni prod'ga qo'llash rejasi (rollback bilan).
- Rollout: gamifikatsiya feature flag orqasida (kerak bo'lsa) bosqichma-bosqich yoqish.

**Acceptance mezonlari:**

- [ ] `npm run typecheck && npm run lint && npm run build` CI'da yashil.
- [ ] `.env.example` yangi o'zgaruvchilar bilan (haqiqiy qiymatsiz) yangilangan.
- [ ] Migratsiya qo'llash + rollback qadamlari hujjatlashtirilgan.
- [ ] Latency byudjeti CI/bench'da tekshiriladi; regressiya deploy'ni bloklaydi.
- [ ] `release-check` checklisti to'liq yashil bo'lmaguncha prod'ga chiqmaydi.

---

## 4. Bog'liqliklar (kim kimni kutadi)

```
Backend 1 (gamification.ts)  ──▶ Backend 2 (API)  ──▶ Frontend 1, Frontend 2
Backend 1 (tiplar)           ──▶ Frontend 1/2 (bir xil tip)
Backend 3 (DB + RLS)         ──▶ Backend 2 (real ma'lumot) ──▶ Security (RLS audit)
Frontend 2 (tokenlar)        ──▶ Frontend 1 (komponentlar shu tokenda)
Hammasi                       ──▶ Tester ──▶ Production
```

Kritik yo'l: **Backend 1 → Backend 2 → Frontend**. Shuning uchun Backend 1 (sof mantiq + tiplar)
va 2.x shartnoma **1-hafta boshida** tayyor bo'lishi kerak; qolganlar mock bilan parallel ishlaydi.

---

## 5. Integratsiya rejasi (3 hafta)

### 1-hafta — Poydevor va shartnoma

- 1-kun: 2-bo'lim shartnomasi (daraja, XP, streak, achievement kodlari, API kontrakti) qotiriladi.
- Backend 1: `src/lib/gamification.ts` sof mantiq + eksport tiplar tayyor.
- Backend 3: migratsiya sxemasi yoziladi, Supabase server klienti; RLS loyihasi Security bilan.
- Frontend 2: dizayn tokenlari (`globals.css`) dark/light; animatsiya variantlari.
- Frontend 1: `/profil` va progress-xarita skeleti (mock ma'lumot bilan).
- Tester: gamification mantig'i uchun unit-test skeleti.

### 2-hafta — Ulash (mock → real)

- Backend 2: `/api/gamification/me`, `/api/leaderboard`, `/api/session` yakuni; avval mock, keyin DB.
- Frontend 1/2: mock'dan real API'ga o'tish; XP/daraja/leaderboard/achievement jonli.
- Backend 3: leaderboard so'rovi (haftalik) real; RLS yoqiladi.
- Security: server/client chegara auditi, RLS testi, PII tekshiruvi.
- Tester: API kontrakt testlari + latency bench (fonda ekanini).

### 3-hafta — Sayqal, sinov, release

- Frontend 1/2: animatsiyalar, mikro-o'zaro ta'sir, dark/light polish, responsive.
- Tester: to'liq regressiya (unit + kontrakt + bench + i18n + vizual smoke).
- Security: yakuniy checklist imzolash.
- Production: `release-check` (typecheck/lint/build/env/latency/i18n), migratsiya qo'llash rejasi.
- Yakun: ROADMAP 3-bosqich ✅ ga o'tkaziladi; SCORING.md XP draft "yakunlangan" deb belgilanadi.

### Integratsiya nazorat nuqtalari (gate)

1. **Kontrakt gate (1-hafta oxiri):** 2-bo'lim va Backend 1 tiplari qotgan; hech kim tipni o'zgartirmaydi.
2. **Real-data gate (2-hafta oxiri):** barcha ekran real API'dan ishlaydi; mock faqat kalitsiz fallback.
3. **Release gate (3-hafta oxiri):** Security ✅ + Tester ✅ + Production `release-check` ✅.

---

## 6. Risklar va yumshatish

| Risk                                  | Ta'sir                 | Yumshatish                                                         |
| ------------------------------------- | ---------------------- | ------------------------------------------------------------------ |
| XP/DB ovoz aylanasini sekinlashtiradi | Latency > 2s           | Barcha yozish fonda (`waitUntil`); Tester bench bilan tekshiradi   |
| Tip nomuvofiqligi (FE↔BE)             | Integratsiya kechikadi | Single source of truth: tiplar `gamification.ts` da; kontrakt gate |
| Light theme'da neon ko'rinmaydi       | Sifat past             | Token asosida; Frontend 2 dark/light ni birga sinaydi              |
| RLS xatosi → ma'lumot sizishi         | Xavfsizlik             | Security roli RLS'ni alohida audit + test qiladi                   |
| Supabase sozlanmagan demo             | Ekran buziladi         | Har route mock fallback beradi (kalitsiz ishlash qoidasi)          |

---

## 7. Sprint yakunida yangilanadigan hujjatlar

- `docs/ROADMAP.md` — 3-bosqich ✅ (yoki qolgan bandlar holati).
- `docs/SCORING.md` — XP formulasi draftdan yakuniyga (2.2 bilan mos).
- `docs/ARCHITECTURE.md` — leaderboard/achievements route'lari amalga oshirilgani belgilanadi (kerak bo'lsa).
