# Supabase — persistensiya

Sotuvchi Trainer'ning ma'lumotlar bazasi (Postgres + Auth). Kalitlar bo'lmasa
loyiha **mock rejimda** ishlaydi — persistensiya jimgina o'chadi, hech narsa
buzilmaydi. Kalitlar qo'shilsa real yozish yoqiladi.

## Sxema

- `supabase/migrations/0001_init.sql` — boshlang'ich jadvallar
  (`users, orgs, sessions, transcripts, scores, subscriptions, leaderboard,
achievements`). Manba: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §3.

## Muhit o'zgaruvchilari

`.env.local` ga (qara `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=        # loyiha URL (brauzerga chiqadi)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon key (RLS bilan himoyalangan)
SUPABASE_SERVICE_KEY=            # service key — FAQAT server, hech qachon commit qilinmaydi
```

`hasSupabase()` (`src/lib/config.ts`) `NEXT_PUBLIC_SUPABASE_URL` **va**
`SUPABASE_SERVICE_KEY` mavjud bo'lgandagina `true` qaytadi. Ikkovi ham bo'lmasa —
server klienti `null`, barcha yozish funksiyalari no-op.

## Migratsiyani qo'llash

### Variant A — Supabase CLI

```bash
supabase db push
# yoki lokal stack:
supabase start
supabase db reset      # migrations/ ni qayta qo'llaydi
```

### Variant B — SQL Editor (Dashboard)

`0001_init.sql` mazmunini nusxalab, Supabase Dashboard → SQL Editor → Run.

### Variant C — psql

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
```

## RLS eslatmasi

Migratsiya barcha jadvallarda RLS'ni **yoqadi**. Server route'lari
(`src/app/api/*`) `SUPABASE_SERVICE_KEY` orqali yozadi — service key RLS'ni
chetlab o'tadi, shuning uchun server yozishlari ishlaydi. Brauzer klienti
(anon key) uchun `select`/`insert` siyosatlari **auth ulangach** qo'shiladi
(namuna kommentlari `0001_init.sql` oxirida).

## Kod bilan bog'lanish

- `src/lib/db/client.ts` — `getSupabase()`: server klient yoki `null` (kalitsiz).
- `src/lib/db/sessions.ts` — `saveSession / finishSession / saveTranscript / saveScore`
  (kalitsiz no-op; latency kritik yo'lni bloklamaydi — fon uchun).
- `src/app/api/session/route.ts` — `POST` create/finish. Kalitsiz `{ persisted: false }`.
