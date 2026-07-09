# DEPLOY — Dokploy (Contabo, self-hosted)

Loyiha Contabo serverida **Dokploy** orqali Docker image sifatida joylanadi. Bu hujjat: nima tayyor, Dokploy'da nimani sozlash kerak, tekshiruv ro'yxati.

## Nima tayyor

- `Dockerfile` — uch bosqichli build (`deps` → `builder` → `runner`), `node:20-alpine`, `output: "standalone"` (`next.config.mjs`) bilan kichik image.
- `.dockerignore` — `node_modules`, `.next`, `.git`, `.claude`, hujjatlar va `.env*` (faqat `.env.example` qoladi) image'ga kirmaydi.
- `public/robots.txt` — `public/` papkasi mavjud (Dockerfile shu papkani kutadi).
- `/api/health` — konteyner sog'ligini tekshirish uchun (`HEALTHCHECK` shu route'ni chaqiradi). Maxfiy qiymat qaytarmaydi, faqat qaysi provayderlar sozlanganini (`openai`, `aisha`, `supabase`).
- Kalitsiz ham konteyner ishga tushadi — mock rejim (CLAUDE.md'dagi qoidaga ko'ra hech qanday funksiya kalitsiz xato tashlamaydi).

## Dokploy'da loyiha yaratish

1. Dokploy panelida **yangi Application** → manba: shu GitHub repo, branch `main` (yoki joriy ishlab chiqish branch'i — deploy oldidan `main`ga birlashtirilgan bo'lishi kerak).
2. **Build type: Dockerfile** (repo ildizidagi `Dockerfile` avtomatik topiladi).
3. **Port**: `3000` (Dockerfile `EXPOSE 3000`, `PORT`/`HOSTNAME` konteyner ichida allaqachon sozlangan).
4. **Health check path**: `/api/health`.
5. Domen bog'lang (Dokploy odatda avtomatik Let's Encrypt/Traefik orqali HTTPS beradi) — masalan `app.sizningdomen.uz`.

## Muhit o'zgaruvchilari

Ikki turga bo'linadi — bu farq muhim, chunki Next.js `NEXT_PUBLIC_*` qiymatlarni **build vaqtida** brauzer bundle'ga yozib qo'yadi:

### 1) Build-time (Dokploy'da "Build Args" bo'limiga)

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Bu ikkovi bo'lmasa — Google orqali kirish tugmasi butunlay yashiriladi (`hasSupabaseAuth()` `false`), ilova mock/localStorage rejimda ishlashda davom etadi (buzilmaydi, faqat Google kirish yo'q).

### 2) Runtime (Dokploy'da "Environment Variables" bo'limiga — server-only, brauzerga chiqmaydi)

```
SUPABASE_SERVICE_KEY=<service_role key>
OPENAI_API_KEY=<key>
OPENAI_MODEL=gpt-4o-mini          # ixtiyoriy, sifat kerak bo'lsa gpt-4o
AISHA_API_KEY=<key>
PAYME_MERCHANT_ID=
PAYME_KEY=
CLICK_MERCHANT_ID=
CLICK_SERVICE_ID=
CLICK_SECRET_KEY=
```

Har biri ixtiyoriy — qaysi biri sozlanmasa, o'sha provayder mock rejimda qoladi (`/api/health` shuni ko'rsatadi). To'liq ro'yxat va izohlar: [`.env.example`](../.env.example).

**Muhim:** `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` build-arg sifatida berilmasa, keyinchalik faqat runtime env qo'shib qayta ishga tushirish YETARLI EMAS — build vaqtida qayta build qilinishi kerak (Dokploy'da "Rebuild").

## Google OAuth — Supabase tomonda sozlash

Loyiha o'zi self-hosted bo'lsa ham, Google Auth **Supabase'ning bulutli Auth xizmati** orqali ishlaydi (frontend/server qayerda joylashganidan mustaqil — faqat Contabo serveridan Supabase API'ga tarmoq ulanishi kerak). To'liq qadamlar: [`supabase/README.md`](../supabase/README.md#google-oauth-sozlash).

Qo'shimcha qadam — domen Contabo'da bo'lgani uchun:

- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs ro'yxatiga qo'shing: `https://<Contabo domeningiz>/auth/callback`.
- Google Cloud Console'dagi OAuth client — Authorized redirect URI o'zgarmaydi (u har doim `https://<PROJECT_REF>.supabase.co/auth/v1/callback`, Contabo domeniga bog'liq emas).

## Ma'lumotlar bazasi migratsiyasi

Deploydan oldin (bir marta): `supabase/migrations/0001_init.sql`, keyin `0002_google_auth.sql` — Supabase Dashboard → SQL Editor orqali qo'llang. Batafsil: [`supabase/README.md`](../supabase/README.md#migratsiyani-qollash).

## Lokal Docker build bilan tekshirish (Dokploy'ga yuborishdan oldin)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  -t sotuvchi-trainer .

docker run -p 3000:3000 \
  -e SUPABASE_SERVICE_KEY=xxx \
  -e OPENAI_API_KEY=xxx \
  -e AISHA_API_KEY=xxx \
  sotuvchi-trainer

curl http://localhost:3000/api/health
```

## Deploy oldi tekshiruv ro'yxati

- [ ] `main` branch — `npm run typecheck && npm run lint && npm test && npm run build` mahalliy yashil (yoki CI yashil).
- [ ] Supabase loyihasi ochilgan, `0001_init.sql` + `0002_google_auth.sql` qo'llangan.
- [ ] Google Cloud OAuth client yaratilgan, Supabase Dashboard'da Google provider yoqilgan.
- [ ] Dokploy: build-arg'lar (`NEXT_PUBLIC_*`) + runtime env'lar to'ldirilgan.
- [ ] Supabase Redirect URLs'ga Contabo domeni qo'shilgan.
- [ ] Deploydan keyin `/api/health` — `providers.supabase: true`, `providers.openai: true` (Aisha hali integratsiya qilinmagan bo'lsa `false` bo'lishi normal — qara ROADMAP).
- [ ] `/boshlash`da Google tugmasi ko'rinadi va bosilganda Google rozilik ekraniga o'tadi.

To'liq release checklist (build/tsc/env/latency/i18n): `release-check` skili (`.claude/skills/release-check`).
