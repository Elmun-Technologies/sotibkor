-- 0002_auth.sql — Self-hosted autentifikatsiya (Supabase Auth' SIZ).
-- Contabo/self-hosted Postgres uchun: users jadvaliga o'z login ma'lumotlari
-- (email + password_hash) qo'shiladi. 0001_init.sql saqlanadi — bu faqat ustiga.
--
-- Farq: 0001'da users.id = auth.users.id (Supabase Auth) edi. Endi Supabase Auth
-- ishlatilmaydi, shuning uchun id o'zimiz gen_random_uuid() bilan generatsiya
-- qilinadi va login uchun email/parol shu jadvalda saqlanadi.

create extension if not exists "pgcrypto";

-- users.id endi o'zi default UUID generatsiya qiladi (Supabase Auth'ga bog'liq emas).
alter table users
  alter column id set default gen_random_uuid();

-- Login ma'lumotlari.
alter table users
  add column if not exists email text,
  add column if not exists password_hash text;

-- Email unikal (bo'sh/NULL bundan mustasno — partial unique index).
create unique index if not exists users_email_uidx
  on users (lower(email))
  where email is not null;

-- Yangi ustunlar uchun izoh.
comment on column users.email is 'Login email (self-hosted auth, unikal, lower-case bo''yicha)';
comment on column users.password_hash is 'bcrypt hash — hech qachon ochiq parol saqlanmaydi';
