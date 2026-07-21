-- 0006_chat_messages.sql — community (/chat) xabarlarini real vaqtli qilish.
--
-- Kontekst: /chat hozircha faqat localStorage'da ishlaydi (src/lib/chat.ts) —
-- boshqa foydalanuvchilar xabarlarni ko'rmaydi. Bu jadval + Supabase Realtime
-- (postgres_changes) orqali barcha sotuvchilar bir xil kanallarda jonli
-- yozishadi. O'qish ochiq (community — barcha kirgan foydalanuvchilar bir-
-- birining xabarini ko'radi), yozish faqat o'z nomidan (auth.uid() = user_id).

create table if not exists chat_messages (
  id         uuid primary key default gen_random_uuid(),
  channel    text not null check (
    channel in ('umumiy', 'narx', 'qongiroq', 'motivatsiya', 'savol-javob')
  ),
  user_id    uuid references users (id) on delete set null,
  author     text not null,
  text       text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_channel_created_idx
  on chat_messages (channel, created_at);

alter table chat_messages enable row level security;

drop policy if exists chat_messages_select_all on chat_messages;
create policy chat_messages_select_all on chat_messages
  for select using (true);

drop policy if exists chat_messages_insert_own on chat_messages;
create policy chat_messages_insert_own on chat_messages
  for insert with check (auth.uid() = user_id);

-- ── Realtime: INSERT hodisalari brauzerga jonli uzatiladi ─────────────
alter publication supabase_realtime add table chat_messages;
