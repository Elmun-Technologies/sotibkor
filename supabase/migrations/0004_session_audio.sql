-- 0004_session_audio.sql — Qo'ng'iroq audio arxivi (issue #8 P1: /arxiv sahifasi).
-- CloseMe-solishtiruv: faqat matn transkript emas — real audio yozuvlar
-- (mijoz TTS + sotuvchi mikrofon) Supabase Storage'da saqlanadi va
-- /arxiv'da qayta eshitiladi.
--
-- Eslatma: bitta mijoz (assistant) "turn"i bir necha jumladan iborat bo'lishi
-- mumkin (SentenceStreamer har jumlani alohida TTS qiladi) — shuning uchun
-- audio klip transcript'ning turn_index'iga QATIY bog'lanmagan, mustaqil
-- o'sib boruvchi clip_index bilan belgilanadi (transkript bilan vaqt bo'yicha
-- mos keladi, lekin alohida FK emas).

create table if not exists session_audio (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions (id) on delete cascade,
  clip_index   int not null,
  speaker      text not null check (speaker in ('sotuvchi', 'mijoz')),
  storage_path text not null,
  mime_type    text not null,
  created_at   timestamptz not null default now()
);
create index if not exists session_audio_session_id_idx on session_audio (session_id);
create unique index if not exists session_audio_session_clip_uidx
  on session_audio (session_id, speaker, clip_index);

alter table session_audio enable row level security;

drop policy if exists session_audio_select_own on session_audio;
create policy session_audio_select_own on session_audio
  for select using (
    exists (
      select 1 from sessions s
      where s.id = session_audio.session_id and s.user_id = auth.uid()
    )
  );

-- ── Storage bucket (xususiy — public emas) ─────────────────────────
-- Faqat server route'lari (SUPABASE_SERVICE_KEY, RLS'ni chetlab o'tadi)
-- yozadi/o'qiydi (imzolangan URL orqali). Anon/brauzer kaliti uchun hech
-- qanday storage siyosati berilmagan — standart holatda kirish yopiq.
insert into storage.buckets (id, name, public)
values ('call-audio', 'call-audio', false)
on conflict (id) do nothing;
