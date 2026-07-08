-- 0001_init.sql — Sotuvchi Trainer boshlang'ich sxema.
-- docs/ARCHITECTURE.md §3 bo'yicha: users, orgs, sessions, transcripts, scores,
-- subscriptions, leaderboard, achievements.
--
-- Eslatma: users.id auth.users.id ga mos keladi (Supabase Auth). Xizmat kaliti
-- (SUPABASE_SERVICE_KEY) RLS'ni chetlab o'tadi — server route'lari shu orqali yozadi.
-- RLS quyida yoqiladi; brauzer klienti (anon key) uchun siyosatlar keyingi
-- bosqichda (auth ulangach) to'ldiriladi.

create extension if not exists "pgcrypto";

-- ── B2B tashkilotlar ────────────────────────────────────────────────
create table if not exists orgs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid,
  created_at timestamptz not null default now()
);

-- ── Foydalanuvchilar (Supabase Auth bilan bog'liq) ──────────────────
create table if not exists users (
  id          uuid primary key,                  -- auth.users.id
  full_name   text,
  role        text not null default 'sotuvchi',  -- 'sotuvchi' | 'boshliq'
  org_id      uuid references orgs (id) on delete set null,
  xp          int  not null default 0,
  level       text not null default 'stajyor',   -- SCORING.md darajalari
  streak_days int  not null default 0,
  trial_used  int  not null default 0,           -- free trial: 3 suhbat
  created_at  timestamptz not null default now()
);

-- orgs.owner_id -> users.id (users yaratilgach FK qo'shiladi)
alter table orgs
  drop constraint if exists orgs_owner_id_fkey;
alter table orgs
  add constraint orgs_owner_id_fkey
  foreign key (owner_id) references users (id) on delete set null;

-- ── Suhbatlar (bitta trening sessiyasi) ─────────────────────────────
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users (id) on delete cascade,
  soha        text,                              -- 'bank' | 'telekom' | 'talim' | 'mebel'
  persona     text,                              -- 'qimmatchi' | ...
  level       int,                               -- qiyinlik 1..N
  status      text not null default 'active',    -- 'active' | 'finished' | 'abandoned'
  duration_ms int,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);
create index if not exists sessions_user_id_idx on sessions (user_id);
create index if not exists sessions_status_idx on sessions (status);

-- ── Transkript (har bir replika alohida qator) ──────────────────────
create table if not exists transcripts (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions (id) on delete cascade,
  turn_index int not null,
  speaker    text,                               -- 'sotuvchi' | 'mijoz'
  text       text,
  latency_ms int,                                -- shu turn uchun o'lchangan aylana vaqti
  created_at timestamptz not null default now()
);
create index if not exists transcripts_session_id_idx on transcripts (session_id);
create unique index if not exists transcripts_session_turn_uidx
  on transcripts (session_id, turn_index);

-- ── Baholar (session tugagach) ──────────────────────────────────────
create table if not exists scores (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid unique references sessions (id) on delete cascade,
  total      int,                                -- 0..100
  breakdown  jsonb,                              -- bo'lim ballari (SCORING.md)
  mistakes   jsonb,                              -- [{quote, why, better}]
  strengths  jsonb,                              -- [text]
  xp_awarded int,
  created_at timestamptz not null default now()
);

-- ── Obuna ───────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users (id) on delete cascade,
  plan       text,                               -- 'free' | 'individual' | 'b2b'
  provider   text,                               -- 'payme' | 'click'
  status     text,                               -- 'trialing' | 'active' | 'expired'
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on subscriptions (user_id);

-- ── Leaderboard (haftalik) ──────────────────────────────────────────
create table if not exists leaderboard (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references users (id) on delete cascade,
  week    date,                                  -- hafta boshi (dushanba)
  xp_week int not null default 0,
  rank    int
);
create unique index if not exists leaderboard_user_week_uidx
  on leaderboard (user_id, week);
create index if not exists leaderboard_week_rank_idx on leaderboard (week, rank);

-- ── Achievements ────────────────────────────────────────────────────
create table if not exists achievements (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references users (id) on delete cascade,
  code      text,                                -- 'first_close' | 'streak_7' | ...
  earned_at timestamptz not null default now()
);
create unique index if not exists achievements_user_code_uidx
  on achievements (user_id, code);

-- ── RLS (Row Level Security) ────────────────────────────────────────
-- RLS yoqiladi. Service key (server) RLS'ni chetlab o'tadi, shuning uchun
-- server route'lari (src/app/api) barcha yozishlarni bemalol bajaradi.
-- Brauzer klienti (anon key) uchun siyosatlar auth ulangach qo'shiladi,
-- masalan: "foydalanuvchi faqat o'z sessions/transcripts/scores'ini o'qiy oladi".
-- Namuna (kelajakda yoqiladi):
--   create policy "own sessions" on sessions
--     for select using (auth.uid() = user_id);
alter table orgs          enable row level security;
alter table users         enable row level security;
alter table sessions      enable row level security;
alter table transcripts   enable row level security;
alter table scores        enable row level security;
alter table subscriptions enable row level security;
alter table leaderboard   enable row level security;
alter table achievements  enable row level security;
