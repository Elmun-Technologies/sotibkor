# Supabase — persistensiya

Sotuvchi Trainer'ning ma'lumotlar bazasi (Postgres + Auth). Kalitlar bo'lmasa
loyiha **mock rejimda** ishlaydi — persistensiya jimgina o'chadi, hech narsa
buzilmaydi. Kalitlar qo'shilsa real yozish yoqiladi.

## Sxema

- `supabase/migrations/0001_init.sql` — boshlang'ich jadvallar
  (`users, orgs, sessions, transcripts, scores, subscriptions, leaderboard,
achievements`). Manba: [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) §3.
- `supabase/migrations/0002_google_auth.sql` — Google OAuth uchun `users`
  jadvalini kengaytiradi (`email, avatar_url, company, team_name, product,
usp, audience, spheres, onboarded, last_active`), `role` ni `'menejer' |
'rop'` ga qattiqlaydi va `users` uchun "faqat o'zini" RLS siyosatlarini
  qo'shadi (brauzer klienti shu jadvalga to'g'ridan-to'g'ri yozadi).

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

`hasSupabaseAuth()` (`src/lib/config.ts`) faqat `NEXT_PUBLIC_SUPABASE_URL` **va**
`NEXT_PUBLIC_SUPABASE_ANON_KEY` talab qiladi (ikkovi ham brauzerga chiqadi) —
Google kirish tugmasi shu funksiya `true` bo'lgandagina `/boshlash` sahifasida
ko'rinadi.

## Migratsiyani qo'llash

### Variant A — Supabase CLI

```bash
supabase db push
# yoki lokal stack:
supabase start
supabase db reset      # migrations/ ni qayta qo'llaydi
```

### Variant B — SQL Editor (Dashboard)

`0001_init.sql`, keyin `0002_google_auth.sql` mazmunini tartib bilan
nusxalab, Supabase Dashboard → SQL Editor → Run.

### Variant C — psql

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/migrations/0002_google_auth.sql
```

## RLS eslatmasi

`0001_init.sql` barcha jadvallarda RLS'ni **yoqadi**. Server route'lari
(`src/app/api/*`) `SUPABASE_SERVICE_KEY` orqali yozadi — service key RLS'ni
chetlab o'tadi, shuning uchun server yozishlari ishlaydi.

`0002_google_auth.sql` `users` jadvali uchun `select`/`insert`/`update`
siyosatlarini qo'shadi (`auth.uid() = id`) — brauzer klienti (anon key,
`src/lib/auth.ts`) Google kirishdan keyin shu jadvalga to'g'ridan-to'g'ri
yozadi. Boshqa jadvallar (`sessions, transcripts, scores, ...`) faqat server
xizmat kaliti orqali yoziladi, shuning uchun ularga hozircha siyosat kerak
emas.

## Google OAuth sozlash

Google orqali kirish ishlashi uchun quyidagilarni **Supabase loyihasi
egasi** (siz) qo'lda bajarishi kerak — kod tomonidan avtomatik qilinmaydi:

1. **Google Cloud Console** → yangi loyiha (yoki mavjudi) → _APIs & Services
   → Credentials_ → _Create Credentials_ → _OAuth client ID_ → turi **Web
   application**.
2. _Authorized redirect URIs_ ga qo'shing:
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
   (`<PROJECT_REF>` — Supabase loyiha manzilidagi subdomen).
3. Yaratilgan **Client ID** va **Client Secret**'ni nusxalang.
4. **Supabase Dashboard** → _Authentication → Providers → Google_ → yoqing,
   2-bandda olingan Client ID/Secret'ni kiriting → Save.
5. **Supabase Dashboard** → _Authentication → URL Configuration → Redirect
   URLs_ ro'yxatiga ilovaning har bir joylashuvi uchun qo'shing:
   - lokal: `http://localhost:3000/auth/callback`
   - prod (Vercel): `https://<domeningiz>/auth/callback`
6. Vercel'da `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   o'rnatilganini tekshiring (`SUPABASE_SERVICE_KEY` bilan bir qatorda) —
   shundagina `/boshlash` sahifasida Google tugmasi ko'rinadi
   (`hasSupabaseAuth()`).

## Kod bilan bog'lanish

- `src/lib/db/client.ts` — `getSupabase()`: server klient yoki `null` (kalitsiz).
- `src/lib/db/sessions.ts` — `saveSession / finishSession / saveTranscript / saveScore`
  (kalitsiz no-op; latency kritik yo'lni bloklamaydi — fon uchun).
- `src/app/api/session/route.ts` — `POST` create/finish. Kalitsiz `{ persisted: false }`.
