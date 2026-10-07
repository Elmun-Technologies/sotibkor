# Sotuvchi Trainer

Sotuvchilar uchun o'zbekcha, ovozli AI trenajor. Foydalanuvchi soha va mijoz
personasini tanlaydi; trener suhbatni olib borib, yakunda transkriptga rubrika
bo'yicha feedback beradi.

> **Integratsiya holati:** kalitsiz rejim demo/mock. Haqiqiy OpenAI, Aisha.ai,
> Supabase Auth va production DB ulanishi egasining credential'lari bilan
> alohida smoke-test qilinmaguncha tasdiqlangan deb hisoblanmaydi. Payme/Click
> checkout va webhook hali implement qilinmagan.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase Auth, Postgres va private Storage
- OpenAI API — persona javoblari va baholash
- Aisha.ai — Uzbek STT/TTS (egasi tasdiqlagan base URL talab qilinadi)
- Tailwind CSS 3 va Framer Motion
- Node.js 22 (local, CI va Docker runtime)

## Lokal ishga tushirish

```bash
npm ci
cp .env.example .env.local   # kerakli qiymatlarni to'ldiring
npm run dev                  # http://localhost:3000
```

Kalitsiz demo uchun `.env.local` shart emas. U real ma'lumotlarni saqlamaydi.
Production/deploy sozlamalari, OAuth, provider readiness va migratsiyalar:
[docs/DEPLOY.md](docs/DEPLOY.md) va [supabase/README.md](supabase/README.md).

## Tekshiruvlar

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check:env
npx playwright install chromium  # first time
npm run test:e2e
```

`npm run start` production standalone server'ni ishga tushiradi.

## Hujjatlar

- [docs/DEPLOY.md](docs/DEPLOY.md) — Docker/Dokploy, env va release checklist
- [supabase/README.md](supabase/README.md) — DB migratsiyasi, RLS va Google OAuth
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arxitektura va xavfsizlik
- [docs/PERSONAS.md](docs/PERSONAS.md) — persona tavsiflari
- [docs/SCORING.md](docs/SCORING.md) — baholash rubrikasi
- [docs/ROADMAP.md](docs/ROADMAP.md) — bajarilgan va rejalashtirilgan ishlar
