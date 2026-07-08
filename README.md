# Sotuvchi Trainer

Sotuvchilar uchun **ovozli AI trenajor**. Sotuvchi soha tanlaydi, AI mijoz rolini o'ynab jaydari o'zbekchada otkaz beradi va manipulyatsiya qiladi; suhbat oxirida alohida LLM transkriptni rubrika bo'yicha baholab, aniq feedback beradi.

## Ovoz aylanasi

```
mikrofon → Aisha.ai STT → Claude (persona, streaming) → Aisha.ai TTS → dinamik
```

To'liq aylana **< 2 soniya** — bu loyihaning kritik metrikasi.

## Stack

- Next.js 14 (App Router) + TypeScript strict
- Supabase (Postgres + Auth)
- Aisha.ai (`mo.aisha.group`) — o'zbek STT/TTS
- Claude API — mijoz personasi + baholovchi
- Tailwind + Framer Motion (dark mode, neon)

## Boshlash

```bash
npm install
cp .env.example .env.local   # qiymatlarni to'ldiring
npm run dev                  # http://localhost:3000
```

Skriptlar: `npm run dev | build | lint | typecheck | format`.

## Hujjatlar

- [CLAUDE.md](CLAUDE.md) — loyiha qoidalari (AI agent uchun ham)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arxitektura, DB sxema, latency byudjeti
- [docs/PERSONAS.md](docs/PERSONAS.md) — 5 persona + jaydari til qoidalari
- [docs/SCORING.md](docs/SCORING.md) — baholash rubrikasi
- [docs/ROADMAP.md](docs/ROADMAP.md) — 6 bosqich reja

## Holat

1-bosqich: **Ovoz aylanasi POC** (joriy). Qara: [docs/ROADMAP.md](docs/ROADMAP.md).
