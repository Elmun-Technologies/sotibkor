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

Keyingi qadam — **1-bosqich, issue #1: real Aisha STT/TTS + Claude persona aylanasi** (kalitlar kerak), so'ng **Supabase** (real auth + ROP jamoa dashboard + to'lov, #8/#9).
