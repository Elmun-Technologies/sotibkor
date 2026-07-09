# Sotuvchi Trainer — production image (Dokploy/Docker uchun).
# Uch bosqich: deps (paketlar) → builder (Next.js build) → runner (kichik, xavfsiz).

# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* qiymatlar build vaqtida brauzer bundle'ga yoziladi —
# shuning uchun build-arg sifatida kerak (runtime env kifoya qilmaydi).
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# prompts/*.md ilova ichida process.cwd()/prompts orqali runtime'da fs bilan
# o'qiladi (src/lib/llm.ts). Next'ning standalone tracing'i buni odatda
# o'zi topib qo'shadi, lekin bu yerda aniq nusxalash — Next versiyasi
# yoki tracing xatti-harakati o'zgarsa ham runtime'da sinmasligi uchun.
COPY --from=builder --chown=nextjs:nodejs /app/prompts ./prompts

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
