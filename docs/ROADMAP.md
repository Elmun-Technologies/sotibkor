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
- 🟡 **Barge-in** (sotuvchi gapni bo'ladi — VAD orqali) — qurildi, lekin real qurilmada kalibrlanmagan; teskari yo'nalish (persona pauza ushlaydi) qurilmadi (issue #7).
- 🟡 **Jamoa dashboard** qurildi (ROP ko'radi), **B2B persona-yasash** va **real interest signal LLM'dan** hali qurilmadi (issue #8).

Yangi ustuvorlik (realizm-first): 🟡 barge-in (kalibrlash kerak) + real Aisha latency (kalitlar kerak) → e'tiroz/voronka baholash (✅ mock) → jonli qiziqish (✅) → persona katalogi + UZ sohalar (✅ qisman) → B2B + to'lov.

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
- ✅ **Xavfsizlik + ishonchlilik, 4-bosqich** — ikkita fon agent (xavfsizlik qayta-auditi + ishonchlilik/SEO auditi) natijasida:
  - **IDOR tuzatildi**: `/api/session` avval so'rov tanasidagi `userId`ga ishonardi (service-role klient RLS'ni chetlab o'tadi) — endi `userId` FAQAT server tomonidagi cookie-sessiyadan olinadi (`currentUserId()`).
  - `/api/chat`, `/api/score`, `/api/stt`, `/api/tts` — kirish hajmi cheklovlari qo'shildi (tarix/transkript ≤60 ta gap, gap ≤4000 belgi, audio ≤15MB, TTS matni ≤2000 belgi) xarajat/DoS himoyasi uchun.
  - Provayderdan (Aisha/OpenAI) kelgan xom xato matni endi klientga chiqmaydi — faqat serverda `console.error` bilan loglanadi, klient umumiy xabar oladi (immersiya/info-leak himoyasi).
  - Open-redirect: `/boshlash` va `/onboarding`dagi `nextUrl()` endi `src/lib/safeNext.ts`dagi umumiy tekshiruvni ishlatadi (`//evil.com`-uslub protokol-nisbiy manzillar rad etiladi) — avval faqat `/auth/callback`da to'g'ri edi.
  - `/auth/callback` Supabase chaqiruvlari try/catch bilan o'ralgan — kutilmagan xato endi 500 emas, `/boshlash?error=auth`ga yo'naltiradi.
  - `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx` qo'shildi (dizayn tizimiga mos, i18n orqali).
  - SEO: `layout.tsx`ga `openGraph`/`twitter`/`robots` metadata + alohida `viewport` export (Next 14.2 deprecation tuzatildi); `sitemap.ts` qo'shildi; `robots.txt` endi auth-gated sahifalarni (`/home`, `/trener`, ... ) `Disallow` qiladi.
- ✅ **A11y + kod sifati, 5-bosqich** — ikkita fon agent (accessibility auditi + o'lik-kod/to'g'rilik auditi) natijasida:
  - **Ovoz aylanasi haqiqiy xatolar**: barge-in paytida `audio.pause()` "ended" hodisasini chaqirmagani uchun `playSentence`ning kutayotgan Promise'i abadiy osilib qolardi (har safar barge-in qilinganda birlashib boradi) — endi `dispatchEvent(new Event("ended"))` bilan darrov yechiladi. Har TTS gap uchun yaratilgan blob URL (`URL.createObjectURL`) hech qachon `revokeObjectURL` qilinmasdi (xotira sizishi) — endi ended/error/catch'da tozalanadi.
  - **XP formula drift tuzatildi**: `xp_awarded`ni LLM o'zi hisoblab qaytarardi (prompt matnida arifmetika) — endi `ScoreResult`ga `closed` (mijoz rozi bo'ldimi) maydoni qo'shildi va `xp_awarded` har doim serverda `src/lib/gamification.ts` `xpForScore()` orqali qayta hisoblanadi (yagona manba).
  - `parseScore` endi `mistakes`/`strengths` massivlarini ham tekshiradi — LLM ularni tashlab ketsa, natija ekrani `.map()` ustida qulamaydi.
  - `/api/session` va `src/lib/db/sessions.ts` (o'lik kod edi — hech qayerdan chaqirilmasdi) `/trener`ning `finish()` funksiyasiga ulandi: baholash tugagach sessiya/transkript/baho fonda Supabase'ga yoziladi (Supabase sozlanmagan bo'lsa jimgina no-op).
  - `/api/chat` va `/api/score`dagi takrorlangan kirish-tekshirish (JSON parse, hajm cheklovi, kesish) `src/lib/http.ts` `parseTurns()`ga chiqarildi; xato-matn ajratish (`(err as Error).message` → `err instanceof Error ? err.message : err`) barcha route/lib fayllarda birxillashtirildi.
  - Dublikat test fayli (`src/lib/levels.test.ts`) o'chirildi (`__tests__/` versiyasi qoldi); `curriculum.ts` uchun test qo'shildi (avval 0% qoplama).
  - **A11y**: mikrofon tugmasiga `aria-label` (avval faqat `aria-hidden` belgi bor edi), jonli transkript/holat `aria-live`, xato xabarlariga `role="alert"`, saqlash/nusxalash tasdig'iga `aria-live`, `SupportWidget`/`AppShell` drawer'lariga fokus-trap + fokus qaytarish, chip guruhlariga `role="group"`, qidiruv/erkin matn input'lariga `aria-label`, onboarding progress'ga `role="progressbar"`, muzokaralar "Batafsil" tugmasiga `aria-expanded`/`aria-controls`, e'tirozlar sevimli tugmasiga `aria-pressed`, karta ichidagi ortiqcha `<h3>` sarlavhalar (h1→h3 sakrashi) `<p>`ga tushirildi, `--faint` CSS tokeni ikkala mavzuda ham WCAG AA (4.5:1) ga yetkazildi.
- 🟡 **Issue #9 — kartasiz sinov + spaced-repetition (Payme/Click parking'da)**:
  - ✅ **Kartasiz 5 bepul suhbat**: `users.trial_used` endi haqiqatan hisoblanadi (`src/lib/db/users.ts`) — har yakunlangan suhbatdan keyin oshadi (`/api/session` `action:"finish"`). Limit `/api/session` `action:"create"`da bir marta tekshiriladi (har LLM chaqiruvida EMAS — `/api/chat` kritik ovoz yo'liga qo'shimcha Supabase round-trip qo'shilmadi, CLAUDE.md §4). Limit tugasa 402 qaytadi, `/trener` setup ekranida aniq xabar + "Tariflarni ko'rish" havolasi ko'rsatiladi. `/tariflar` va sidebar'dagi "5/5" endi real ma'lumot (avval hardcode edi).
  - ✅ **Spaced-repetition persistensiya**: suhbat tugagach `src/lib/coach.ts` `recommend()` server tomonda chaqiriladi, eng zaif e'tiroz turi `users.weak_objection_type`ga saqlanadi (`0003_trial_and_weak_objection.sql`). Keyingi safar `/trener` setup ekrani ochilganda shu turga mos persona (`personaForObjection()` — narx→qimmatchi, ishonch→shubhali, vaqt→bandman, qaror→yumshoq-lekin-olmaydi, raqobat→bilagon) oldindan tanlanadi va tavsiya belgisi ko'rsatiladi (dars sahifasidan aniq preset kelgan bo'lsa tegilmaydi).
  - ⬜ **Payme + Click to'lov**: ATAYLAB QURILMADI. Real merchant credential (`PAYME_MERCHANT_ID/KEY`, `CLICK_MERCHANT_ID/SERVICE_ID/SECRET_KEY`) yo'q holda checkout/webhook kodi yozish — tasdiqlanmagan taxminlarga asoslangan pul-bilan-ishlaydigan kod bo'lardi (xuddi Aisha BASE_URL holatidagi kabi xavf, faqat bu safar haqiqiy pul). Sandbox credential kelgach: `POST /api/subscription/webhook` (Payme JSON-RPC: CheckPerformTransaction/CreateTransaction/PerformTransaction/CancelTransaction; Click: md5 imzo tekshiruvi), checkout URL generatsiyasi, `subscriptions` jadvaliga yozish.
  - ⬜ **Real LLM interest signal**: hozir `interestScore()` (`src/lib/coach.ts`) sof evristika — real LLM signalga o'tkazilmadi (kam ustuvor, issue #9ning asosiy qabul mezoniga kirmaydi).
- 🟡 **Issue #7 — to'liq barge-in (VAD asosida, faqat sotuvchi→persona yo'nalishida)**:
  - ✅ **Ovoz faolligini aniqlash (VAD)**: `src/lib/useVoiceActivity.ts` — Web Audio API (`AnalyserNode` + vaqt-domeni RMS) orqali mikrofon balandligini kuzatadi; persona gapirayotganda (`speaking`) sotuvchi tugma bosmasdan gapirsa, barqaror ovoz aniqlanib (`sustainMs` — qisqa shovqinni filtrlaydi) `stopSpeaking()` avtomatik chaqiriladi. `/trener` chat bosqichida faollashadi, `echoCancellation`/`noiseSuppression` yoqilgan (dinamikdan chiqqan persona ovozi mikrofonga qaytib o'z-o'zini bo'lib qo'ymasligi uchun asosiy himoya).
  - ⚠️ **MUHIM CHEKLOV**: chegara qiymatlari (`thresholdRms=30`, `sustainMs=220ms`) **haqiqiy mikrofon/qurilma bilan sinovdan o'tkazilmagan** — bu ishlab chiqish muhitida audio uskunasi yo'q. Real foydalanuvchilar bilan kalibrlash kerak (juda sezgir bo'lsa — fon shovqinidan noto'g'ri ishga tushadi; juda kam sezgir bo'lsa — sekin javob beradi). Eng yomon holatda persona bir oz erta/kech to'xtaydi — qo'lda mikrofon/matn tugmasi baribir to'liq ishlaydi, hech narsa buzilmaydi.
  - ⬜ Mikrofon ruxsati rad etilsa yoki brauzer Web Audio API'ni qo'llab-quvvatlamasa — VAD jimgina o'chadi (sinovdan o'tkazilgan: ikkala holat ham Playwright orqali xatosiz tekshirildi).
  - ⬜ **Teskari yo'nalish** ("persona pauza ushlaydi" — mijoz sotuvchining pauzasini kutish/bo'lish xulqi) qurilmadi — bu prompt-mantiqiy o'zgarish (personalar allaqachon navbat-navbat suhbatlashadi), audio-muhandislik emas.
- 🟡 **Issue #8 — persona katalogi + B2B builder + jamoa dashboard (qisman)**:
  - ✅ **Jamoa dashboard**: `/analitika` sahifasiga ROP-uchun (`role === "rop"`) "Jamoa" kartasi qo'shildi — har sotuvchi bo'yicha o'rtacha ball (reyting tartibida), eng zaif voronka bosqichi va eng zaif e'tiroz turi ko'rsatiladi. `TeamRow` tipi (`src/lib/types.ts`) `funnel`/`weakObjection` maydonlari bilan kengaytirildi, `GET /api/team-stats` qo'shildi (`MOCK_TEAM` — 4 nafar sotuvchi, real per-funnel/e'tiroz taqsimoti bilan). Menejer rolida bu karta ko'rinmaydi (Playwright bilan ikkala rol ham tekshirildi).
  - ⚠️ **CHEKLOV**: hozircha faqat mock ma'lumot — real DB rejimida (`hasSupabase()`) haliyam `MOCK_TEAM` qaytadi (`TODO` qoldirilgan: `users.org_id`/`team_name` bo'yicha guruhlash + haqiqiy sessiyalardan voronka hisoblash kerak).
  - ✅ **Persona identifikatsiyasi (avatar + lavozim + real ism)**: har personaning `defaultName`i bor (`src/lib/content.ts`), 9 ta ssenariyning har biri `lavozim` maydoni bilan kengaytirildi (`src/lib/scenarios.ts`). `scenarioHref()`/`customHref()` ism+lavozimni `/trener?name=..&lavozim=..` query orqali uzatadi; preset bo'lmasa persona `defaultName`iga tushadi. `{{mijoz_ismi}}` promptlarga qo'shildi — AI suhbat boshida shu ism bilan tanishtiradi. Harf-avatar o'rniga `PersonaAvatar` (`src/components/ui/PersonaAvatar.tsx`) — real fotosiz (image-gen kaliti yo'q), har xarakterga mos gradient+chizilgan belgi (tanga/ko'zoynak/soat/qalpoq/tabassum) — `/qongiroq` katalogi, SetupPanel chiplari va CallView'da bir xil ishlatiladi.
  - ⬜ **B2B persona builder** (kompaniya mahsulot+e'tiroz kiritsa — YANGI AI persona prompti generatsiya qilinadi): eng katta qism, ATAYLAB QURILMADI. Hozirgi `/qongiroq` "o'z mijozingni yarat" formasi shunchaki 5 ta MAVJUD personadan birini tanlab, kosmetik ism/kontekst qo'shadi — haqiqiy yangi prompt yaratmaydi. To'g'ri qurish uchun real `OPENAI_API_KEY` bilan generatsiya sifatini tekshirish (`prompt-tester` subagent orqali) va yaratilgan promptlarni saqlash strategiyasi (Supabase jadvali — `/prompts/*.md` runtime'da yozib bo'lmaydi) kerak.
- ✅ **CloseMe-solishtiruv P1: mic-check + real audio arxiv**:
  - **Mikrofon tekshiruvi**: `/trener` endi `setup → miccheck → chat` bosqichlaridan o'tadi (`src/lib/useMicCheck.ts`, `src/components/trener/MicCheck.tsx`) — suhbat boshlashdan oldin foydalanuvchi mikrofonini RMS o'lchagich bilan ko'radi, ruxsat rad etilsa ham matn rejimida davom etish imkoni bor. Ssenariy preset orqali kelgan suhbatlar ham endi shu bosqichdan o'tadi — bu yon ta'sir sifatida avvalgi bo'shliqni ham yopdi: preset oqimi `startSession()`ni (demak kartasiz sinov limiti tekshiruvini) butunlay chetlab o'tardi, endi hammasi bir xil yo'ldan o'tadi.
  - **Real audio arxiv (`/arxiv`)**: faqat matn transkript emas — mijoz (Aisha TTS) va sotuvchi (mikrofon yozuvi) audiosi Supabase Storage'ga (`call-audio`, xususiy bucket) yoziladi va qayta eshitiladi. `supabase/migrations/0004_session_audio.sql` (`session_audio` jadvali, RLS — faqat egasi), `src/lib/audioStorage.ts` (`uploadTurnAudio`/`getSessionAudioClips`), `src/lib/db/sessions.ts`ga `listSessions`/`getSessionDetail` qo'shildi, uchta API route (`GET /api/archive`, `GET /api/archive/[id]`, `POST /api/archive/audio`), yangi `/arxiv` sahifa (ro'yxat → detal: transkript + baho + audio pleyerlar). Yuklash klientdan **fire-and-forget** (`src/lib/archiveClient.ts`, `void fetch(...)`, hech qachon await qilinmaydi) — ovoz aylanasining kritik yo'liga (STT→LLM→TTS) hech qanday kechikish qo'shmaydi (CLAUDE.md §4).
  - ⚠️ **CHEKLOV**: real Supabase loyihasi yo'q (bu sessiyada hech qachon haqiqiy kalit qo'shilmagan) — Storage yuklash/imzolangan URL/RLS siyosati **jonli sinovdan o'tkazilmagan**, faqat kod ko'rib chiqish + mock-rejim (Supabase yo'q holatda hammasi jimgina no-op, `/arxiv` bo'sh holatni ko'rsatadi) Playwright bilan tasdiqlangan. Real kalit qo'shilgach `voice-test`/qo'lda sinov kerak.
- ✅ **CloseMe-solishtiruv P3: detal polishlar** (hammasi jonli, hardcode emas):
  - **/home boshlash checklisti** (3 qadam: ro'yxat / profil / birinchi suhbat) — HAQIQIY lokal signallardan (`isOnboarded` + `src/lib/progress.ts` birinchi yakunlangan suhbat belgisi trener finish oqimidan), barcha qadam bajarilgach yashiriladi.
  - **Jonli sevimlilar** (`src/lib/favorites.ts`, localStorage): /home kun e'tirozidagi o'lik "Sevimlilarga" tugmasi endi ishlaydi va saqlanadi; /etirozlar sevimlilari ham xotiradan localStorage'ga ko'chdi (reload'da yo'qolmaydi). /home'ga "Takrorlash" tugmasi + keyingi kun e'tirozigacha countdown, kun fikriga kitob/manba qatori.
  - **/qongiroq qidiruv + ko'rinish + sozlash**: ism/lavozim/xarakter bo'yicha matn qidiruvi, Katak/Ro'yxat ko'rinish tugmasi, har karta uchun ⚙ "Sozlash" paneli (qiyinlik/rejim/til rejimini boshlashdan oldin override qiladi — `scenarioHref(s, overrides)` orqali). Yaratilgan mijozlar endi localStorage'da saqlanadi (`src/lib/customClients.ts`) — avval reload'da yo'qolardi.
  - **/analitika radar + sana oralig'i**: 5 baholash o'lchovi bo'yicha "Ko'nikma profili" radar diagramma (`src/components/gamification/RadarChart.tsx` — kutubxonasiz SVG, TrendChart konvensiyasi), 7/30/Hammasi sana oralig'i tanlovi (trend + o'rtacha ballni kesadi). `MOCK_SKILLS` mock qo'shildi.
- ✅ **10x-1 g'oya: Til rejimi** (sof o'zbek / aralash / rus) — closeme faqat rus tilida, biz farqni formallashtirdik. `src/lib/content.ts` `TilRejimKey`, 5 ta persona promptida `{{til_rejimi}}` placeholder (avval hammasida bir xil hardcode "Aralash til" bandi edi), `/api/chat`da `TIL_REJIM_MATN` mapping, SetupPanel'da yangi chip tanlovi.
- ✅ **10x-2 g'oya: Jonli murabbiy** (suhbat DAVOMIDA maslahat, closeme faqat suhbatdan KEYIN baholaydi) — `src/lib/coach.ts` `liveHint()`: sof evristika (darrov chegirma, erta narx, ochiq savol yo'qligi, uzun monolog, qisqa javob, yaxshi holat), LLM chaqiruvi yo'q — ovoz aylanasiga (STT→LLM→TTS) hech qanday kechikish qo'shmaydi. CallView'da rang-kodlangan bildirishnoma.
- ✅ **10x-9 g'oya: PWA/mobil-birinchi** — `src/app/manifest.ts` (Next.js manifest konvensiyasi, `app.json` i18n manbasidan nom/tavsif oladi), `public/icon-192.png`/`icon-512.png` (mavjud brend belgisidan — AppShell logotipi — Playwright orqali rasterlangan, yangi tashqi rasm-generatsiya kaliti kerak bo'lmadi), `layout.tsx`ga `appleWebApp`/`icons` metadata. Xizmat skripti (offline keshlash) qurilmadi — faqat "Bosh ekranga qo'shish" (installability).
- ✅ **10x-8 g'oya: Sertifikat (gamifikatsiya+)** — closeme'da yo'q: erishgan daraja uchun ulashiladigan SVG guvohnoma. `src/components/gamification/Certificate.tsx` — sof SVG (tashqi kutubxonasiz), foydalanuvchi ismi/daraja/XP/suhbatlar/sana bilan; "Yuklab olish (SVG)" tugmasi klient tomonda blob orqali. `/profil`da "Sertifikat" kartasi. Real foydalanuvchi ma'lumotidan (mock rejimda MOCK_USER).
- ✅ **10x-4 g'oya: Haftalik reja (deterministik yadro)** — closeme'da yo'q: sotuvchining eng zaif e'tirozini (spaced-repetition, `getWeakObjection`) markazga qo'yib 7 kunlik maqsadli mashq rejasi. `src/lib/weeklyPlan.ts` `generateWeeklyPlan()` — sof funksiya (LLM yo'q): zaif tur 1- va takror-kunlarda, qolgan kunlar boshqa turlar bilan, daraja hafta oxiriga oshadi. /home'da "Haftalik reja" kartasi (7 kun, bugun ajratilgan, har kun persona avatari + e'tiroz turi, preset trener havolasi). Bajarilgan kunlar localStorage'da joriy hafta bo'yicha (`src/lib/progress.ts`, yangi haftada avtoreset), trener finish oqimidan belgilanadi. 9 yangi test. LLM asosidagi "mentor izohi" keyingi bosqichda (real OPENAI_API_KEY) — interfeys o'zgarmaydi.
- ✅ **10x-3 g'oya: Nutq tahlili (matn asosidagi qism)** — closeme faqat bitta umumiy ball beradi; biz sotuvchining NUTQ ODATLARINI ham tahlil qilamiz. `src/lib/coach.ts` `analyzeSpeech()`: sof funksiya (LLM yo'q) — parazit so'zlar (`FILLER_WORDS`: ee/aa/yani/koroche/vot/anaqa/tipa/...), o'rtacha gap uzunligi, savol nisbati, eng uzun gap. ResultView'da "Nutq tahlili" kartasi (4 stat + parazit chiplar + dolzarb maslahat), 7 yangi test. ⬜ **Qolgan qism**: ovoz tempi/pauzalar (real STT vaqt belgilaridan) — real Aisha STT ulangach qo'shiladi (matn transkriptda vaqt ma'lumoti yo'q).

### Mock-rejimda "100%" nimani anglatadi

Kalitsiz (mock) rejimda kutish mumkin bo'lgan barcha sahifa/oqim/UI ishi tugallangan: 16 sahifa (landing, ro'yxatdan o'tish, onboarding, bosh sahifa, trener/qo'ng'iroq, e'tirozlar+tezkor mashq, qo'ng'iroq ssenariylari, muzokaralar, vazifalar, analitika, reyting, yutuqlar, tariflar, profil+sozlash, arxiv), sidebar ilova qobig'i, yordam vidjeti — barchasi ishlaydi, o'zaro bog'langan, i18n orqali, typecheck/lint/118 test/build doim yashil.

**Quyidagilar FAQAT tashqi hisob ma'lumotlari (API kalit/loyihalar) bilan davom etadi — men ularsiz "tugata olmayman":**

- **Real ovoz aylanasi** — `AISHA_API_KEY` (STT/TTS) va `OPENAI_API_KEY` (persona/baholovchi, `gpt-4o-mini`). Hozir mock: matn kiritish + brauzer ovozi.
- **Google orqali kirish** — kod tomoni tayyor (`@supabase/ssr`, `/auth/callback`, `0002_google_auth.sql`). Ishlashi uchun foydalanuvchi Supabase loyihasi (`NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`) ochib, Google Cloud'da OAuth client yaratib, Supabase Dashboard'da Google provayderni yoqishi kerak — qadamlar `supabase/README.md`da.
- **Ma'lumotlar bazasi (sessiya/transkript/baho saqlash)** — `SUPABASE_SERVICE_KEY`. Hozir: sessiyalar saqlanmaydi, faqat joriy oynada ko'rinadi.
- **To'lov** — Payme/Click merchant ma'lumotlari. Hozir: `/tariflar` UI tayyor, tugmalar bosilganda "tez orada" xabari.

Bular sozlanganda: `voice-test` skili bilan latency o'lchanadi, keyin ROP jamoa/topshiriq biriktiruvini haqiqiy DB'ga ko'chirish, keyin to'lov ulanadi — kod tomoni (adapterlar, DB helper'lar, env o'qish) allaqachon tayyor turibdi.

Keyingi qadam — **1-bosqich, issue #1: real Aisha STT/TTS + OpenAI persona aylanasi** (kalitlar kerak), so'ng sessiya/transkript persistensiyasi + to'lov (#8/#9).
