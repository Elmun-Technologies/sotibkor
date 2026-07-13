-- 0003_trial_and_weak_objection.sql — kartasiz sinov + spaced-repetition.
--
-- Kontekst: issue #9. `users.trial_used` allaqachon 0001_init.sql'da bor edi
-- (izohi eskirgan — "3 suhbat" edi, lekin UI/landing hammasi 5 ta va'da
-- qiladi: src/lib/db/users.ts TRIAL_LIMIT=5 shu manbaga mos). Bu migratsiya
-- ustun qo'shmaydi — faqat izohni to'g'irlaydi va spaced-repetition uchun
-- yangi ustunlarni qo'shadi.

comment on column users.trial_used is 'free trial: 5 suhbat (src/lib/db/users.ts TRIAL_LIMIT)';

-- ── Spaced-repetition: eng zaif e'tiroz turi (src/lib/coach.ts recommend()) ─
alter table users add column if not exists weak_objection_type text;
alter table users add column if not exists weak_objection_at timestamptz;

alter table users
  drop constraint if exists users_weak_objection_type_check;
alter table users
  add constraint users_weak_objection_type_check
  check (
    weak_objection_type is null
    or weak_objection_type in ('narx', 'ishonch', 'vaqt', 'ehtiyoj', 'qaror', 'raqobat')
  );
