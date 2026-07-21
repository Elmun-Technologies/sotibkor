-- 0005_custom_clients.sql — foydalanuvchi yaratgan mijozlarni hisobga bog'lash.
--
-- Kontekst: /qongiroq "o'z mijozingni yarat" formasi hozircha faqat
-- localStorage'da saqlaydi (src/lib/customClients.ts) — qurilma/brauzer
-- almashsa yo'qoladi. Bu jadval shu yozuvlarni foydalanuvchi hisobiga
-- bog'laydi. Brauzer klienti (anon key) `users` jadvali bilan bir xil
-- naqshda to'g'ridan-to'g'ri yozadi — RLS "faqat o'zini" siyosati bilan.

create table if not exists custom_clients (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  name        text not null,
  company     text,
  soha        text not null,
  persona     text not null,
  description text,
  created_at  timestamptz not null default now()
);
create index if not exists custom_clients_user_id_idx on custom_clients (user_id);

alter table custom_clients enable row level security;

drop policy if exists custom_clients_select_own on custom_clients;
create policy custom_clients_select_own on custom_clients
  for select using (auth.uid() = user_id);

drop policy if exists custom_clients_insert_own on custom_clients;
create policy custom_clients_insert_own on custom_clients
  for insert with check (auth.uid() = user_id);

drop policy if exists custom_clients_delete_own on custom_clients;
create policy custom_clients_delete_own on custom_clients
  for delete using (auth.uid() = user_id);
