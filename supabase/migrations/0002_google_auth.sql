-- 0002_google_auth.sql — Google OAuth (Supabase Auth) uchun users jadvalini kengaytirish.
--
-- Kontekst: src/lib/auth.ts endi Google orqali kirgan foydalanuvchi profilini
-- brauzer klienti (anon key, RLS ostida) orqali users jadvaliga o'qiydi/yozadi.
-- Shu sabab: (1) yangi ustunlar, (2) role qiymatlari 'menejer'|'rop' ga mos
-- keltiriladi, (3) users jadvali uchun "faqat o'zini" RLS siyosatlari qo'shiladi.
--
-- Boshqa jadvallar (sessions, transcripts, scores, ...) hali ham faqat
-- server xizmat kaliti orqali yoziladi (src/lib/db) — RLS chetlab o'tiladi,
-- shuning uchun ularga siyosat shart emas.

-- ── Ustunlar ─────────────────────────────────────────────────────────
alter table users add column if not exists email       text;
alter table users add column if not exists avatar_url  text;
alter table users add column if not exists company     text;
alter table users add column if not exists team_name   text;
alter table users add column if not exists product     text;
alter table users add column if not exists usp         text;
alter table users add column if not exists audience    text;
alter table users add column if not exists spheres     text[] not null default '{}';
alter table users add column if not exists onboarded   boolean not null default false;
alter table users add column if not exists last_active date;

create unique index if not exists users_email_uidx on users (email) where email is not null;

-- ── role qiymatlarini yangilash ─────────────────────────────────────
-- Eski sxema: 'sotuvchi' | 'boshliq'. Yangi: 'menejer' | 'rop'.
update users set role = 'menejer' where role = 'sotuvchi';
update users set role = 'rop'     where role = 'boshliq';

alter table users
  drop constraint if exists users_role_check;
alter table users
  add constraint users_role_check check (role in ('menejer', 'rop'));
alter table users
  alter column role set default 'menejer';

-- ── RLS: users — foydalanuvchi faqat o'z qatorini ko'radi/yozadi ────
drop policy if exists users_select_own on users;
create policy users_select_own on users
  for select using (auth.uid() = id);

drop policy if exists users_insert_own on users;
create policy users_insert_own on users
  for insert with check (auth.uid() = id);

drop policy if exists users_update_own on users;
create policy users_update_own on users
  for update using (auth.uid() = id) with check (auth.uid() = id);
