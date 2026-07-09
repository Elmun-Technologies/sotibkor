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
- ✅ Persona chaqiruvi streaming (`/api/chat`, `src/lib/llm.ts`): Claude (kalit bo'lsa) yoki mock oqim.
- ✅ Gap-gap TTS: `SentenceStreamer` birinchi gapni darrov ovozga (Aisha `/api/tts` yoki brauzer Web Speech fallback).
- ✅ Latency o'lchagich (LLM first-token, TTS boshlanishi, to'liq aylana) + `npm run bench:voice`.
- ⬜ **Aisha.ai STT/TTS real endpoint** (`src/lib/aisha.ts` TODO) — rasmiy hujjat kelgach.
- ⬜ Real ANTHROPIC_API_KEY bilan jonli Claude persona sinovi va latency o'lchash.

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
- ✅ **E'tirozlar playbook** (`/etirozlar`) — tur bo'yicha filtr, uslub teglari (Logika/Ekspertlik/Intriga/Dojim/Bosim), "o'z javobingni sina" (mock AI baho).
- ✅ **Qo'ng'iroq ssenariylari** (`/qongiroq`) — nomli mijoz katalogi (soha × persona × qiyinlik), filtrlar, "o'z mijozingni yarat".
- ✅ **Vazifalar** (`/vazifalar`) — menejer topshiriqlari + ROP topshiriq biriktirish va jamoa holati (rol bo'yicha).

Keyingi qadam — **1-bosqich, issue #1: real Aisha STT/TTS + Claude persona aylanasi** (kalitlar kerak), so'ng **Supabase** (real auth + ROP jamoa dashboard + to'lov, #8/#9).
