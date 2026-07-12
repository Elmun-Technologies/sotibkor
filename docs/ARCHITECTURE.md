# ARCHITECTURE

Sotuvchi Trainer'ning texnik arxitekturasi: ovoz aylanasi, komponentlar, ma'lumotlar bazasi va latency byudjeti.

## 1. Ovoz aylanasi (voice loop)

Bu loyihaning yuragi. Foydalanuvchi gapiradi → matnga aylanadi → persona javob beradi → ovozga aylanadi → eshitiladi. Butun aylana **< 2 soniya** ichida bo'lishi shart, aks holda suhbat "jonli" his qilinmaydi.

```
┌──────────┐   audio     ┌───────────┐   text      ┌──────────────┐
│ Mikrofon │ ──────────▶ │ Aisha STT │ ──────────▶ │  OpenAI API  │
│ (brauzer)│  (webm/opus)│ mo.aisha  │  (o'zbek)   │  persona     │
└──────────┘             └───────────┘             │  (streaming) │
     ▲                                             └──────┬───────┘
     │ audio                                              │ text (gap-gap)
     │                   ┌───────────┐   audio            │
     └────────────────── │ Aisha TTS │ ◀──────────────────┘
       dinamik           │ mo.aisha  │  birinchi gap tayyor bo'lishi
                         └───────────┘  bilan darrov TTS'ga
```

**Muhim optimizatsiya — streaming pipeline:** OpenAI javobini to'liq kutmaymiz. Streamdan birinchi **to'liq gap** (`.`/`?`/`!` bo'yicha ajratish) kelishi bilan uni darrov TTS'ga yuboramiz va o'ynay boshlaymiz; qolgan gaplar fonda tayyorlanadi. Bu perceived latency'ni keskin kamaytiradi.

**Barge-in (kelajak):** foydalanuvchi persona gapirayotganda gapira boshlasa, TTS to'xtaydi va yangi STT boshlanadi.

## 2. Komponentlar

### Frontend (`src/app`)

- **Mikrofon controller** — `MediaRecorder` bilan audio yozadi, chunk'larni STT route'ga oqim qilib yuboradi (yoki VAD bilan gap oxirini aniqlaydi).
- **Suhbat UI** — jonli transkript, persona "gapiryapti" indikatori, latency badge (dev rejimda).
- **Audio player** — TTS'dan kelgan audio chunk'larni navbat bilan uzluksiz o'ynaydi.

### Backend (`src/app/api` — Next.js Route Handlers)

- `POST /api/stt` — audio → matn (Aisha STT proxy). Kalitlar server tomonda.
- `POST /api/chat` — transkript kontekst → OpenAI persona javobi (**streaming**, `ReadableStream`).
- `POST /api/tts` — matn → audio (Aisha TTS proxy).
- `POST /api/score` — tugagan suhbat transkripti → baholovchi LLM → JSON natija.
- `POST /api/session` — suhbat boshlash/yakunlash, transkriptni saqlash.

### Kutubxona qatlami (`src/lib`)

- `aisha.ts` — Aisha.ai/UzbekVoice STT/TTS klient (real fetch integratsiya, ENV bilan sozlanadigan endpoint/auth; kalit bilan tasdiqlash kutilmoqda).
- `llm.ts` — OpenAI klient. Streaming helper, promptni `/prompts`'dan yuklaydi.
- `scoring.ts` — transkriptni baholovchi promptga uzatadi, JSON'ni parse/validatsiya qiladi.

### Tashqi servislar

- **Aisha.ai** (`mo.aisha.group`) — o'zbek STT/TTS.
- **OpenAI** — persona + baholovchi.
- **Supabase** — Postgres + Auth.

## 3. Ma'lumotlar bazasi sxemasi (draft)

Supabase (Postgres). Bu draft — migratsiyalar issue #3'da yoziladi.

```sql
-- Foydalanuvchilar (Supabase Auth bilan bog'liq)
users (
  id            uuid PRIMARY KEY,          -- auth.users.id
  email         text,
  avatar_url    text,
  full_name     text,
  role          text DEFAULT 'menejer',    -- 'menejer' | 'rop' (B2B), CHECK bilan
  org_id        uuid REFERENCES orgs(id),  -- B2B jamoa (nullable)
  company       text,
  team_name     text,
  product       text, usp text, audience text, spheres text[],  -- onboarding profili
  onboarded     boolean DEFAULT false,
  xp            int  DEFAULT 0,
  level         text DEFAULT 'stajyor',    -- SCORING.md darajalari
  streak_days   int  DEFAULT 0,
  trial_used    int  DEFAULT 0,            -- free trial: 3 suhbat
  last_active   date,
  created_at    timestamptz DEFAULT now()
)

-- B2B tashkilotlar
orgs (
  id         uuid PRIMARY KEY,
  name       text,
  owner_id   uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
)

-- Suhbatlar (bitta trening sessiyasi)
sessions (
  id           uuid PRIMARY KEY,
  user_id      uuid REFERENCES users(id),
  soha         text,                       -- 'bank' | 'telekom' | 'talim' | 'mebel'
  persona      text,                       -- 'qimmatchi' | ...
  level        int,                        -- qiyinlik 1..N
  status       text DEFAULT 'active',      -- 'active' | 'finished' | 'abandoned'
  duration_ms  int,
  started_at   timestamptz DEFAULT now(),
  ended_at     timestamptz
)

-- Transkript (har bir replika alohida qator)
transcripts (
  id          uuid PRIMARY KEY,
  session_id  uuid REFERENCES sessions(id),
  turn_index  int,
  speaker     text,                        -- 'sotuvchi' | 'mijoz'
  text        text,
  latency_ms  int,                         -- shu turn uchun o'lchangan aylana vaqti
  created_at  timestamptz DEFAULT now()
)

-- Baholar (session tugagach)
scores (
  id            uuid PRIMARY KEY,
  session_id    uuid REFERENCES sessions(id) UNIQUE,
  total         int,                        -- 0..100
  breakdown     jsonb,                      -- bo'lim ballari (SCORING.md)
  mistakes      jsonb,                      -- [{quote, why, better}]
  strengths     jsonb,                      -- [text]
  xp_awarded    int,
  created_at    timestamptz DEFAULT now()
)

-- Obuna
subscriptions (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  plan        text,                         -- 'free' | 'individual' | 'b2b'
  provider    text,                         -- 'payme' | 'click'
  status      text,                         -- 'trialing' | 'active' | 'expired'
  expires_at  timestamptz,
  created_at  timestamptz DEFAULT now()
)

-- Leaderboard (haftalik, materialized yoki jadval)
leaderboard (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  week        date,                         -- hafta boshi (dushanba)
  xp_week     int,
  rank        int
)

-- Achievements
achievements (
  id          uuid PRIMARY KEY,
  user_id     uuid REFERENCES users(id),
  code        text,                         -- 'first_close' | 'streak_7' | ...
  earned_at   timestamptz DEFAULT now()
)
```

## 3.1 Autentifikatsiya (Google OAuth, Supabase Auth)

Ro'yxatdan o'tish/kirish ikki qatlamda ishlaydi:

- **localStorage keshi** (`sotibkor_user`, `sotibkor_profile`) — barcha `(app)`
  sahifalarining sinxron gating'i (`isRegistered()`, `isOnboarded()`,
  `getUser()`) shu keshni o'qiydi, hech qanday sahifa Supabase kutmaydi.
- **Supabase Auth (Google OAuth)** — `hasSupabaseAuth()` (faqat
  `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` kerak) yoqilgan
  bo'lsa haqiqiy manba: kirishdan keyin `users` jadvali keshga ko'chiriladi
  (`syncFromSupabase`, ilova yuklanganda bir marta) va keshdagi o'zgarishlar
  orqaga surib yuboriladi (`saveProfile` → `pushProfileToSupabase`, fire-and-forget).

Oqim:

```
"Google orqali kirish" → supabase.auth.signInWithOAuth("google")
  → Google rozilik ekrani
  → GET /auth/callback?code=...        (kod → sessiya almashtiriladi)
      users jadvalida qator yo'q       → /boshlash?step=role  (rol tanlash)
      users.onboarded = false          → /onboarding
      users.onboarded = true           → so'ralgan sahifa (?next=)
```

`src/middleware.ts` har so'rovda Supabase sessiya cookie'sini yangilaydi;
`NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` bo'lmasa butunlay no-op (mock rejim
buzilmaydi). `users` jadvali RLS bilan himoyalangan — brauzer klienti
(anon key) faqat `auth.uid() = id` bo'lgan qatorni o'qiy/yoza oladi
(`supabase/migrations/0002_google_auth.sql`); boshqa jadvallar hali ham
faqat server xizmat kaliti orqali yoziladi.

## 4. API route'lar rejasi

| Route                       | Metod | Vazifa                       | Streaming     |
| --------------------------- | ----- | ---------------------------- | ------------- |
| `/auth/callback`            | GET   | Google OAuth kod almashinuvi | —             |
| `/api/session`              | POST  | Suhbat boshlash / yakunlash  | —             |
| `/api/stt`                  | POST  | Audio → matn (Aisha)         | chunked       |
| `/api/chat`                 | POST  | Persona javobi (OpenAI)      | ✅ SSE/stream |
| `/api/tts`                  | POST  | Matn → audio (Aisha)         | chunked       |
| `/api/score`                | POST  | Transkript → baho JSON       | —             |
| `/api/leaderboard`          | GET   | Haftalik reyting             | —             |
| `/api/subscription/webhook` | POST  | Payme/Click callback         | —             |

Barcha route'lar server tomonda; Aisha/OpenAI kalitlari hech qachon brauzerga chiqmaydi.

## 5. Latency byudjeti

Maqsad: to'liq aylana **< 2000 ms** (idrok qilinadigan).

| Bosqich                        | Byudjet      | Izoh                             |
| ------------------------------ | ------------ | -------------------------------- |
| Mikrofon → STT yakuni          | ~500 ms      | gap oxiri aniqlangach STT natija |
| OpenAI first-token             | ~400 ms      | streaming, birinchi token        |
| Birinchi gap → TTS boshlanishi | ~500 ms      | TTS birinchi audio chunk         |
| Tarmoq / overhead              | ~300 ms      | proxy, serialization             |
| **Jami (perceived)**           | **~1700 ms** | 300ms zaxira                     |

**Qoidalar:**

- Kritik yo'lda (STT→LLM→TTS) og'ir sinxron ish yo'q (DB yozish, analitika — fonda).
- LLM javobi **gap-gap** oqim qilib TTS'ga uzatiladi, butun javob kutilmaydi.
- Transkript/ball DB'ga yozish suhbatdan keyin yoki fonda (`waitUntil`).
- Har turn uchun `latency_ms` o'lchanadi va saqlanadi; benchmark skripti (issue #5) buni monitoring qiladi.
