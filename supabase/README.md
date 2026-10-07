# Supabase — persistensiya va auth

Sotuvchi Trainer Supabase Auth va Postgres/Storage'dan foydalanadi. Provider
kalitlari bo'lmasa ilova mock/demo rejimda ishlashi mumkin, ammo ma'lumotlar
saqlanmaydi. Production'da `SUPABASE_SERVICE_KEY` faqat server runtime env'da
bo'lishi shart; uni hech qachon `NEXT_PUBLIC_*` qilib yoki brauzerga bermang.

## Migratsiyalar

Har bir production Supabase loyihasiga quyidagi fayllarni **tartib bilan, bir
marta** qo'llang:

1. `0001_init.sql` — `users`, `sessions`, `transcripts`, `scores`,
   `subscriptions`, `leaderboard`, `achievements` jadvallari va RLS.
2. `0002_google_auth.sql` — profil ustunlari, `menejer`/`rop` role constraint'i,
   `users` jadvali uchun foydalanuvchiga tegishli RLS siyosatlari.
3. `0003_trial_and_weak_objection.sql` — trial izohi va spaced-repetition
   ustunlari.
4. `0004_session_audio.sql` — private `call-audio` storage bucket,
   `session_audio` jadvali va owner-scoped select policy.
5. `0005_secure_sessions.sql` — trial limit bilan session yaratish hamda
   session owner'ini tekshirgan holda transcript/score/status'ni tranzaksiyada
   yakunlaydigan RPC'lar. Ularni `public`, `anon`, `authenticated` uchun yopib,
   faqat `service_role`ga execute huquqi beradi.

**Production'da barcha besh migratsiya qo'llanmaguncha sessiya persistensiyasini
yoqmang.** Ayniqsa 0005 bo'lmasa yangi API route'lar RPC chaqiradi va
persistensiya xatosi qaytaradi; eski alohida insert/update yo'liga qaytish
xavfsiz emas.

### Variant A — Dashboard SQL Editor (repo'da Supabase CLI config bo'lmasa tavsiya)

Supabase Dashboard → SQL Editor'da har bir migration faylini oching va Run
qiling, tartibni buzmang. Har migration muvaffaqiyatli tugaganini ko'rmaguncha
keyingisini bajarmang. Mavjud production bazasida `DROP`, `db reset` yoki
migration fayllarini qayta-qayta ishlatishga urinmang.

### Variant B — Supabase CLI

CLI bilan ishlatishda avval Supabase loyihasiga `link` qiling va `db push`
oldidan `--dry-run` natijasini ko'rib chiqing. `supabase db reset` faqat lokal
dev stack uchun — production ma'lumotlarini o'chirishi mumkin.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
```

Bu repo'da hozir `supabase/config.toml` yo'q; CLI talab qilsa `supabase init`
bilan config yaratib, migratsiyalarni ko'rib chiqqandan keyingina davom eting.

### Variant C — psql

Faqat to'g'ri production connection string va migration history nazorati bilan
ishlating; birinchi marta qo'llashda:

```bash
for migration in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration" || exit 1
done
```

Migration history'ni yuritish uchun production'da dashboard yoki Supabase CLI
usulini tanlash afzal.

## Muhit o'zgaruvchilari

`.env.local` yoki deploy platformasida (to'liq namunasi: [`.env.example`](../.env.example)):

```env
NEXT_PUBLIC_SUPABASE_URL=        # loyiha URL (brauzerga chiqadi)
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon key (RLS ostida)
SUPABASE_SERVICE_KEY=            # service_role key — FAQAT server runtime env
```

`hasSupabase()` URL + service key'ni, `hasSupabaseAuth()` URL + anon key'ni
tekshiradi. Public env qiymatlari build-time'da client bundle'ga yoziladi; service
key esa hech qachon bundle yoki logga chiqmasligi kerak.

## RLS va session ownership

`0001_init.sql` barcha asosiy jadvallarda RLS yoqadi. Brauzer anon client'i
faqat `users` jadvalidagi o'z qatoriga kira oladi. Sessiya, transcript, score
va audio yozuvlari server route'laridan service-role orqali bajariladi.

`0005_secure_sessions.sql`dagi RPC'lar `p_user_id` qiymatini cookie'dan
olmaydi va `service_role`ga ishonadi. Shuning uchun ilova avval
`supabase.auth.getUser()` bilan haqiqiy foydalanuvchini tekshiradi va
`p_user_id` sifatida faqat shu `user.id`ni uzatadi. Service key'ni hech qachon
client'ga bermang.

- `create_training_session` user row'ini lock qilib trial increment va session
  insert'ini atomik bajaradi.
- `complete_training_session` faqat `session_id + user_id + active` mos
  bo'lganda sessiyani tugatadi va transcript/score'ni shu tranzaksiyada yozadi.
- Audio route `session_id` egasini tekshiradi; audio private bucket'da
  saqlanadi va arxivda qisqa muddatli signed URL beriladi.

## Google OAuth sozlash

Google orqali kirish ishga tushishi uchun loyiha egasi quyidagilarni sozlashi
kerak:

1. Google Cloud Console'da OAuth client (Web application) yarating.
2. Google'dagi authorized redirect URI'ga Supabase callback'ni kiriting:
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`.
3. Supabase Dashboard → Authentication → Providers → Google'da provider'ni
   yoqing va Client ID/Secret'ni kiriting.
4. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs'ga
   lokal va haqiqiy deploy URL'larni qo'shing, masalan:
   - `http://localhost:3000/auth/callback`
   - `https://<production-domain>/auth/callback`
5. Deploy build-time args'da `NEXT_PUBLIC_SUPABASE_URL` va
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server runtime env'da
   `SUPABASE_SERVICE_KEY` borligini tekshiring.
6. Production domenida Google OAuth round-trip'ni amalda tekshiring.

## Kod bilan bog'lanish

- `src/lib/supabase/server.ts` — Next.js server context uchun Supabase Auth
  client; async `cookies()` ishlatadi.
- `src/lib/supabase/user.ts` va `src/lib/apiSecurity.ts` — sessiyadagi user'ni
  serverda tekshiradi.
- `src/lib/db/sessions.ts` — session create/complete RPC chaqiruvlari va
  owner-scoped archive query'lari.
- `src/app/api/session/route.ts` — autentifikatsiya, input validation, rate
  limit va create/finish API.
- `src/app/api/archive/audio/route.ts` — bounded multipart upload, owner check
  va private storage.
