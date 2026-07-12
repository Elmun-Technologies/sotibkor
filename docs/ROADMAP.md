# ROADMAP

Sotuvchi Trainer 6 bosqichda quriladi. Har katta feature'dan keyin shu fayl yangilanadi (holat: ⬜ rejalashtirilgan / 🟡 jarayonda / ✅ tugadi).

## Raqobat pozitsiyasi — closeme.ru'dan 10x

closeme faqat **rus tili + Rossiya B2B** bilan cheklangan. Bizning moat — O'zbekiston:

- ✅ **Jaydari o'zbek + aralash til (code-switching)** — persona promptlarida ("aka, davay dogovorimsya"). closeme buni qila olmaydi.
- ✅ **Ikki rejim**: sovuq qo'ng'iroq **va** yuzma-yuz savdolashuv (O'zbekiston bozori reali).
- ✅ **Jonli qiziqish o'lchagichi** (`src/lib/coach.ts` `interestScore`) — closeme "Интерес"idan kuchliroq (sparkline + dinamika).
- ✅ **Voronka-bosqich baholash** + **spaced-repetition tavsiyasi** (zaif e'tirozga qarab keyingi mashq).
- ✅ **E'tiroz kutubxonasi** (`src/lib/objections.ts`) — tur bo'yicha teglangan.
- ✅ **Ball trendi** (profil) — bir martalik ball emas, vaqt bo'yicha o'sish.
- ⬜ **To'liq barge-in** (persona pauza ushlaydi/gapni bo'ladi) — real full-dupleks audio + VAD kerak (issue).
- ⬜ **B2B persona-yasash + dashboard**, **real interest signal LLM'dan** (issue).

Yangi ustuvorlik (realizm-first): barge-in + real Aisha latency → e'tiroz/voronka baholash (✅ mock) → jonli qiziqish (✅) → persona katalogi + UZ sohalar (✅ qisman) → B2B + to'lov.

## 1. Ovoz aylanasi POC — 🟡 HOZIRGI BOSQICH (2–3 hafta)

Maqsad: bitta sahifada to'liq ovoz aylanasi ishlashini isbotlash. Chiroyi muhim emas, **latency** muhim.

Plumbing tayyor (provider abstraktsiyasi + mock rejim, kalitsiz ishlaydi):

- ✅ Suhbat sahifasi (`/trener`): soha/persona/level tanlash, jonli transkript, latency badge.
- ✅ Mikrofon yozib olish (`MediaRecorder`) → `/api/stt` (Aisha sozlanmagan bo'lsa matn kiritish fallback).
- ✅ Persona chaqiruvi streaming (`/api/chat`, `src/lib/llm.ts`): OpenAI (kalit bo'lsa) yoki mock oqim.
- ✅ Gap-gap TTS: `SentenceStreamer` birinchi gapni darrov ovozga (Aisha `/api/tts` yoki brauzer Web Speech fallback).
- ✅ Latency o'lchagich (LLM first-token, TTS boshlanishi, to'liq aylana) + `npm run bench:voice`.
- 🟡 **Aisha.ai STT/TTS** (`src/lib/aisha.ts`) — real fetch integratsiya yozildi, lekin so'rov/javob shakli (multipart STT, JSON TTS) UzbekVoice/Mohir'ning ommaviy API pattern'iga asoslangan **taxmin** (rasmiy hujjatga bu muhitdan kirib bo'lmadi — 403). `AISHA_BASE_URL` MAJBURIY (kod hech qanday manzilni o'zi taxmin qilmaydi, xavfsizlik uchun) — bo'lmasa aniq xato tashlaydi. Real `AISHA_API_KEY` + tasdiqlangan `AISHA_BASE_URL` bilan sinab ko'rish va farq bo'lsa `AISHA_STT_PATH`/`AISHA_TTS_PATH`/`AISHA_AUTH_SCHEME` orqali moslashtirish kerak. Brauzer webm/opus yozadi — API boshqa format talab qilsa, konvertatsiya keyingi qadam.
- ⬜ Real OPENAI_API_KEY bilan jonli OpenAI persona sinovi va latency o'lchash.

**Yakun mezoni:** Qimmatchi bilan ovozli suhbat, aylana < 2s (real kalitlar bilan).

## 2. Baholash tizimi (2 hafta)

- ✅ Baholovchi prompt (`prompts/scoring/baholovchi.md`).
- ✅ `/api/score` route + `src/lib/scoring.ts` JSON validatsiya (mock fallback ham).
- ✅ Natija sahifasi: ball, bo'lim progress-barlar, xatolar + namunalar, kuchli tomonlar, XP.
- ⬜ Real Claude baholovchi bilan sifat sinovi.
- ⬜ Transkript saqlash (Supabase `sessions` / `transcripts` / `scores`) — issue #3.

**Yakun mezoni:** suhbat tugagach aniq, o'stiruvchi feedback ko'rsatiladi.

## 3. Gamification + UI — 🟡 JARAYONDA (3 hafta)

Sprint rejasi: [docs/SPRINT-GAMIFICATION.md](SPRINT-GAMIFICATION.md) (rollar, acceptance, integratsiya).

- 🟡 XP, darajalar (Stajyor → … → Sales Master), streak.
- 🟡 Haftalik leaderboard.
- 🟡 Achievements.
- 🟡 Progress-xarita (typing club uslubi).
- 🟡 Dark mode + neon dizayn, Framer Motion animatsiyalar.

**Yakun mezoni:** foydalanuvchi o'sishini ko'radi, qaytib kelishga motivatsiya bor.

## 4. Kontent: sohalar, personalar, darajalar (2 hafta)

- ⬜ 4 soha: bank, telekom, ta'lim, mebel/texnika (`soha-qoshish` skili bilan).
- ⬜ 5 persona to'liq sozlangan va sinovdan o'tgan (`prompt-tester`).
- ⬜ Daraja 1–6+ balans.
- ⬜ Seed data (mahsulotlar, otkazlar, skript-shpargalkalar).

**Yakun mezoni:** har soha uchun mazmunli, xilma-xil suhbatlar.

## 5. Subscription + B2B dashboard (1–2 hafta)

- ⬜ Free trial (3 suhbat) mantig'i.
- ⬜ Payme integratsiyasi.
- ⬜ Click integratsiyasi.
- ⬜ Individual va B2B tariflar.
- ⬜ B2B dashboard: boshliq jamoa statistikasini ko'radi.

**Yakun mezoni:** to'lov ishlaydi, B2B boshliq jamoasini kuzatadi.

## 6. Launch: pilot, case study

- ⬜ Pilot guruh (real sotuvchilar bilan).
- ⬜ Fikr-mulohaza yig'ish va iteratsiya.
- ⬜ Case study / natijalar.
- ⬜ Marketing va ochiq launch.

**Yakun mezoni:** haqiqiy foydalanuvchilar, o'lchangan natija.

---

## Joriy holat (2026-07-09)

Skafold + mock-rejim ilovasi tayyor: ro'yxatdan o'tish (menejer/ROP), onboarding, dashboard, ta'lim yo'li, qo'ng'iroq trenajori (mock ovoz aylanasi), reyting, profil.

Yangi (closeme'dan moslashtirilgan, sidebar ilova qobig'i bilan):

- ✅ **Sidebar ilova qobig'i** (`(app)` route-group + `AppShell`) — chapda doimiy navigatsiya, bepul suhbat hisoblagichi, foydalanuvchi kartasi; mobilda drawer.
- ✅ **E'tirozlar playbook** (`/etirozlar`) — ikki panelli ro'yxat+tafsilot (closeme uslubida), har e'tirozga bir nechta uslub teglangan javob (Logika/Ekspertlik/Intriga/Dojim/Bosim/Yumor), sevimli/nusxalash, "o'z javobingni sina" (mock AI baho).
- ✅ **Tezkor mashq** (`/etirozlar` → drill) — closeme "Тренировка"ga o'xshash: e'tirozlarni checkbox + takror-hisoblagich bilan tanlash, qiyinlik darajasi, ketma-ket savol-javob (har javobga darhol mock AI ball+feedback), yakunda o'rtacha ball va eng kuchli/zaif tur.
- ✅ **Qo'ng'iroq ssenariylari** (`/qongiroq`) — nomli mijoz katalogi (soha × persona × qiyinlik), filtrlar, "o'z mijozingni yarat".
- ✅ **Vazifalar** (`/vazifalar`) — menejer topshiriqlari + ROP topshiriq biriktirish va jamoa holati (rol bo'yicha).
- ✅ **Muzokaralar** (`/muzokaralar`) — closeme "Переговоры"ga o'xshash: bitim yakuniy bosqichi ssenariylari (chegirma/to'lov/yetkazish talablari), qidiruv, "Barcha/Mening ssenariylarim" tab, progressiv qulflangan ilg'or ssenariylar (daraja bo'yicha ochiladi), "o'z ssenariyingni yarat".
- ✅ **Analitika** (`/analitika`) — closeme "Аналитика"ga o'xshash dashboard: daraja/trening/o'rtacha ball statistikasi, ball trendi, suhbat voronkasi (5 bosqich), e'tiroz turi bo'yicha muvaffaqiyat foizi, xulq-atvor xatolari, AI xulosalari + "ko'nikmani oshirish" CTA (mock ma'lumot bilan — closeme'ning o'zi ham demo hisobda bo'sh ko'rsatadi, bizniki mazmunli).
- ✅ **Yutuqlar** (`/yutuqlar`) — closeme "Достижения"ga o'xshash: 6 ta kategoriya (Sovuq qo'ng'iroqlar, Qo'ng'iroq sifati, Progress, Intizom, Muzokaralar, Afsonaviy), 22 ta yutuq, umumiy ochilgan/XP hisoblagichi. `/profil` va `/reyting` endi qisqa preview (6/3 ta) + "Barchasini ko'rish" havolasi ko'rsatadi — dublikat saqlanmaydi.
- ✅ **Tariflar** (`/tariflar`) — closeme'ning tarif kartalaridan moslashtirilgan (so'mda): Bepul/Amaliyot/Profi/Cheksiz, joriy tarif + suhbat statistikasi. Sidebar'dagi "Tariflarni ko'rish" tugmasi endi shu sahifaga olib boradi (avval /reyting'ga noto'g'ri yo'naltirilgan edi). To'lov tugmalari hozircha mock — Payme/Click ulanmagan (#5).
- ✅ **Profil → Mahsulot ma'lumotlari** — onboarding'da bir marta kiritilgan mahsulot/UTP/auditoriya/soha endi `/profil`da tahrirlanadi va saqlanadi (avval faqat write-once edi). `/profil`ga standart auth gating ham qo'shildi (avvalgi holatda yo'q edi).
- ✅ **Yordam vidjeti** — closeme'ning global "Поддержка" tugmasidan moslashtirilgan: `(app)` qobig'ining har qanday sahifasida pastki o'ng burchakda suzuvchi tugma, bosilganda telefon/Telegram/email + nusxalash bilan modal ochiladi (demo kontakt, real kanal keyingi bosqichda).
- ✅ **Qo'ng'iroq → O'z mijozingni yarat (funksional)** — avval faqat kosmetik (2 maydonli, hech qayerga ulanmagan) edi. Endi to'liq forma: ism, kompaniya, soha, xarakter (persona) tanlovi + kontekst — yaratilgan mijoz haqiqiy kartaga aylanadi va "Qo'ng'iroq" tugmasi to'g'ridan-to'g'ri shu soha/persona bilan `/trener`ga olib boradi.
- ✅ **CallView kontekst chiplari** — closeme'ning qo'ng'iroq ekranidagi "Отрасль/Должность" chiplaridan ilhomlangan: suhbat davomida avatar kartasida doimiy ko'rinadigan "Soha" va "Mijoz turi" chiplari (kim bilan gaplashayotganini eslatib turadi) + transkript ustida "mikrofon fon shovqinini ham yozadi" ogohlantirishi. Faqat vizual qatlam — ovoz aylanasi (STT/LLM/TTS) o'zgarmadi, latency riski yo'q.
- ✅ **UI taste-audit + to'liqlik tekshiruvi** — github.com/Leonxlnx/taste-skill'ning ochiq qo'llanmasi (o'rnatish `npx` orqali xavfsizlik siyosati bilan bloklandi, shuning uchun SKILL.md matni o'qilib qo'lda qo'llanildi) va ikkita fon agent (to'liqlik + xavfsizlik auditi) natijasida:
  - Button/Chip/ThemeToggle/AppShell nav/SupportWidget — barchasiga `active:scale` bosim feedback qo'shildi; `Card`ga ixtiyoriy `interactive` prop (hover lift + chuqur soya, ikkala mavzu uchun CSS token orqali).
  - 7 ta hardcode UI matni topildi va tuzatildi (i18n qoidasi buzilishi): landing sahifa 3 ta Eyebrow ("Moat"/"Skills"/"Halollik"), `/boshlash` orqaga havolasi + telefon/email placeholder'lari + fallback ism, `/tariflar` valyuta so'zi.
  - `/vazifalar` sahifasidagi joyida yozilgan mock ma'lumot (topshiriqlar, jamoa) `src/lib/mock/index.ts` va `src/lib/types.ts`ga ko'chirildi — endi barcha demo ma'lumot bitta manbada (achievements/leaderboard bilan bir xil pattern).
  - Xavfsizlik auditi: kritik topilma yo'q — API kalitlar faqat `process.env` orqali, server-only kalitlar client bundle'ga sizmaydi, `.env*` git'dan tashqarida, `dangerouslySetInnerHTML` faqat statik tema-init skriptida.
  - Dead link yo'q, bo'sh/"coming soon" sahifa yo'q, i18n fayllarida bo'sh qiymat yo'q (24 ta namespace to'liq tekshirildi).
- ✅ **Google orqali kirish (Supabase Auth)** — `@supabase/ssr` bilan haqiqiy OAuth oqimi: `/boshlash`da "Google orqali kirish" tugmasi (faqat `hasSupabaseAuth()` bo'lganda ko'rinadi), `GET /auth/callback` kod almashinuvi + birinchi marta kirgan foydalanuvchi uchun rol tanlash qadami (`?step=role`), `src/middleware.ts` sessiya cookie yangilash. Mavjud ~15 sahifaning sinxron auth-gating kodi butunlay o'zgarmadi — Supabase `users` jadvali localStorage keshiga ko'chiriladi (`syncFromSupabase`), profil o'zgarishlari fonda orqaga suriladi (`pushProfileToSupabase`). `supabase/migrations/0002_google_auth.sql` — `users`ga yangi ustunlar (email, avatar, company, team, mahsulot profili, onboarded), `role` CHECK (`'menejer'|'rop'`) va "faqat o'zini" RLS siyosatlari. Kod tomoni to'liq tayyor — ishga tushishi uchun foydalanuvchiga Supabase loyihasi + Google Cloud OAuth client kerak (qadamlar: `supabase/README.md` § Google OAuth sozlash).
  - Parallel branch'da self-hosted email/parol auth (bcrypt+JWT+Postgres, PR #14) ham qurilgan va `main`ga birlashtirilgan edi — ikkalasi bir xil fayllarni (`auth.ts`, `middleware.ts`, `/boshlash`) qayta yozgani uchun birga tura olmasdi. Qaror: **Google OAuth qoladi** (loyiha Contabo'da self-hosted ishga tushsa ham, Google Auth Supabase'ning bulutli Auth backend'i orqali ishlaydi). Self-hosted variant (`api/auth/*`, `auth-server.ts`, `db/pg.ts`, `db/users.ts`, `0002_auth.sql`, `bcryptjs`/`jose`/`pg`) olib tashlandi.
- ✅ **Dokploy/Docker deploy tayyorgarligi** — `Dockerfile` (uch bosqichli, `node:20-alpine`, standalone output), `.dockerignore`, `next.config.mjs`'da `output: "standalone"`, `public/robots.txt`. Batafsil qo'llanma + env checklist: [docs/DEPLOY.md](DEPLOY.md). Lokal `next build` bilan standalone artefaktlar (`server.js`, traced `prompts/`) tekshirilgan.
- ✅ **UI optimizatsiya, 3-bosqich** — vizual sweep (barcha 13 sahifa, ikkala tema, mobil) + performance agent auditi:
  - **KRITIK latency**: `src/middleware.ts` matcher `api/*` ni istisno qilmagan edi — har bir STT/TTS/chat chaqiruvi Supabase sessiya-yangilash bilan kechikardi (CLAUDE.md §4 — <2s byudjetini buzardi). Endi `api/*` middleware'dan butunlay chetlashtirilgan (hech bir route handler cookie orqali sessiya o'qimaydi).
  - `/trener`dagi `CallView`/`ResultView` `next/dynamic({ssr:false})` bilan lazy-load qilindi — "setup" bosqichida ovoz-aylana kodi umuman yuklanmaydi.
  - Landing "Nimani mashq qilasan" tag-cloud'da CSS `rotate()` transform kichik `gap-3` bilan qo'shni chip'larga vizual tegib turardi — `gap-x-4 gap-y-5`ga kattalashtirildi.
  - `reyting`/`yutuqlar` sahifalaridagi statik `MOCK_*` massivlar ustidagi hisob-kitoblar (`filter`/`reduce`/`sort`) komponent render funksiyasidan modul darajasiga ko'chirildi (`useMemo`dan ham arzonroq — hech qachon qayta hisoblanmaydi).

### Mock-rejimda "100%" nimani anglatadi

Kalitsiz (mock) rejimda kutish mumkin bo'lgan barcha sahifa/oqim/UI ishi tugallangan: 15 sahifa (landing, ro'yxatdan o'tish, onboarding, bosh sahifa, trener/qo'ng'iroq, e'tirozlar+tezkor mashq, qo'ng'iroq ssenariylari, muzokaralar, vazifalar, analitika, reyting, yutuqlar, tariflar, profil+sozlash), sidebar ilova qobig'i, yordam vidjeti — barchasi ishlaydi, o'zaro bog'langan, i18n orqali, typecheck/lint/69 test/build doim yashil.

**Quyidagilar FAQAT tashqi hisob ma'lumotlari (API kalit/loyihalar) bilan davom etadi — men ularsiz "tugata olmayman":**

- **Real ovoz aylanasi** — `AISHA_API_KEY` (STT/TTS) va `OPENAI_API_KEY` (persona/baholovchi, `gpt-4o-mini`). Hozir mock: matn kiritish + brauzer ovozi.
- **Google orqali kirish** — kod tomoni tayyor (`@supabase/ssr`, `/auth/callback`, `0002_google_auth.sql`). Ishlashi uchun foydalanuvchi Supabase loyihasi (`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`) ochib, Google Cloud'da OAuth client yaratib, Supabase Dashboard'da Google provayderni yoqishi kerak — qadamlar `supabase/README.md`da.
- **Ma'lumotlar bazasi (sessiya/transkript/baho saqlash)** — `SUPABASE_SERVICE_KEY`. Hozir: sessiyalar saqlanmaydi, faqat joriy oynada ko'rinadi.
- **To'lov** — Payme/Click merchant ma'lumotlari. Hozir: `/tariflar` UI tayyor, tugmalar bosilganda "tez orada" xabari.

Bular sozlanganda: `voice-test` skili bilan latency o'lchanadi, keyin ROP jamoa/topshiriq biriktiruvini haqiqiy DB'ga ko'chirish, keyin to'lov ulanadi — kod tomoni (adapterlar, DB helper'lar, env o'qish) allaqachon tayyor turibdi.

Keyingi qadam — **1-bosqich, issue #1: real Aisha STT/TTS + OpenAI persona aylanasi** (kalitlar kerak), so'ng sessiya/transkript persistensiyasi + to'lov (#8/#9).
