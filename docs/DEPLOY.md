# DEPLOY — Dokploy (Contabo, self-hosted)

Loyiha Contabo serverida **Dokploy** orqali Docker image sifatida joylanadi. Bu hujjat: nima tayyor, Dokploy'da nimani sozlash kerak, tekshiruv ro'yxati.

## Nima tayyor

- `Dockerfile` — uch bosqichli build (`deps` → `builder` → `runner`), `node:22-alpine`, `output: "standalone"` (`next.config.mjs`) bilan kichik image.
- `.dockerignore` — `node_modules`, `.next`, `.git`, `.claude`, hujjatlar va `.env*` (faqat `.env.example` qoladi) image'ga kirmaydi.
- `public/robots.txt` — `public/` papkasi mavjud (Dockerfile shu papkani kutadi).
- `/api/health` — konteyner liveness tekshiruvi (`HEALTHCHECK` shu route'ni chaqiradi). `ok` server tirikligini bildiradi; maxfiy qiymatlarni qaytarmaydi. `mode`, `providers` va `readiness` maydonlari sozlangan holatni ko'rsatadi.
- Kalitsiz konteyner mock/demo rejimda ishga tushadi; haqiqiy AI/audio integratsiyasi egasining provider credential'lari bilan alohida tasdiqlanishi kerak.

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

OpenAI, Aisha va Supabase qiymatlari yetishmasa tegishli funksiya live rejimga o'tmaydi (`/api/health`da readiness `false`). Aisha uchun haqiqiy HTTPS `AISHA_BASE_URL` va endpoint/auth formatini egasi tasdiqlashi shart. `PAYME_*`/`CLICK_*` qiymatlari hozircha ishlatilmaydi: checkout/webhook integratsiyasi hali mavjud emas. To'liq ro'yxat va izohlar: [`.env.example`](../.env.example).

**Muhim:** `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` build-arg sifatida berilmasa, keyinchalik faqat runtime env qo'shib qayta ishga tushirish YETARLI EMAS — build vaqtida qayta build qilinishi kerak (Dokploy'da "Rebuild").

## Google OAuth — Supabase tomonda sozlash

Loyiha o'zi self-hosted bo'lsa ham, Google Auth **Supabase'ning bulutli Auth xizmati** orqali ishlaydi (frontend/server qayerda joylashganidan mustaqil — faqat Contabo serveridan Supabase API'ga tarmoq ulanishi kerak). To'liq qadamlar: [`supabase/README.md`](../supabase/README.md#google-oauth-sozlash).

Qo'shimcha qadam — domen Contabo'da bo'lgani uchun:

- Supabase Dashboard → Authentication → URL Configuration → Redirect URLs ro'yxatiga qo'shing: `https://<Contabo domeningiz>/auth/callback`.
- Google Cloud Console'dagi OAuth client — Authorized redirect URI o'zgarmaydi (u har doim `https://<PROJECT_REF>.supabase.co/auth/v1/callback`, Contabo domeniga bog'liq emas).

## Ma'lumotlar bazasi migratsiyasi

Deploydan oldin (bir marta), production Supabase loyihasiga `supabase/migrations/` ichidagi **0001–0005 migratsiyalarini tartib bilan** qo'llang. Ayniqsa `0005_secure_sessions.sql` shart: sessiya yaratishdagi trial limit va yakuniy transcript/score yozuvi RPC orqali atomik bajariladi. Barcha migratsiyalardan keyin `/api/health` va sessiya oqimini tekshiring. Dashboard → SQL Editor bo'yicha batafsil ko'rsatma: [`supabase/README.md`](../supabase/README.md#migratsiyalar).

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
  -e AISHA_BASE_URL=https://api.example.com \
  sotuvchi-trainer

curl http://localhost:3000/api/health
```

## Dependency audit

`npm audit --omit=dev --audit-level=moderate` hozir 0 production vulnerability qaytaradi. To'liq `npm audit` esa dev-only lint/CSS tooling zanjirida hozircha 9 moderate/high finding ko'rsatadi (`eslint-config-next`/`fast-glob`, Tailwind CSS 3 va uning parser/watch dependencies). `npm audit fix` mos major'siz tuzata olmadi; Tailwind 4 yoki linter toolchain'ni moslashtirish alohida tekshirilishi kerak. Shuning uchun `--force` ishlatilmadi va bu finding'lar release checklist'da ochiq qoladi.

## Deploy oldi tekshiruv ro'yxati

- [ ] Release qilinadigan commitda `npm run typecheck && npm run lint && npm test && npm run build` yashil.
- [ ] Production Supabase loyihasida `0001_init.sql`–`0005_secure_sessions.sql` to'liq va tartib bilan qo'llangan.
- [ ] Google Cloud OAuth client yaratilgan, Supabase Dashboard'da Google provider yoqilgan va production callback URL ruxsat etilgan.
- [ ] Dokploy: `NEXT_PUBLIC_*` qiymatlar build-time args; service/provider key'lar faqat runtime env'da.
- [ ] `npm run check:env` natijasi kutilgan `voice`, `db`, `auth` rejimlarini ko'rsatadi. Bu faqat konfiguratsiya tekshiruvi: haqiqiy Aisha endpoint, auth sxemasi, STT/TTS va xarajat egasining credential'lari bilan smoke-test qilinishi shart.
- [ ] `/api/health` `ok: true` qaytaradi; live rejim talab qilinsa `readiness.voice`, `readiness.database`, `readiness.auth` ham `true`.
- [ ] `/boshlash`da Google tugmasi ko'rinadi va haqiqiy OAuth round-trip production domenida muvaffaqiyatli.
- [ ] Playwright Chromium o'rnatilgan muhitda `npm run test:e2e` o'zgarishsiz yashil.

To'liq release checklist (build/tsc/env/latency/i18n): `release-check` skili (`.claude/skills/release-check`).
