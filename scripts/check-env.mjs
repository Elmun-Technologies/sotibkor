#!/usr/bin/env node
/**
 * Vendor-tayyorlik tekshiruvi — deploy oldi yoki lokal ishga tushirishda
 * qaysi rejimlar sozlanganini ko'rsatadi. Hech qanday kalit QIYMATI chiqarilmaydi,
 * faqat "sozlangan / yo'q" bayonoti. Ixtiyoriy xavfsiz ulanish tekshiruvi (HEAD)
 * faqat manzil mavjudligini tekshiradi va hech qanday maxfiy ma'lumot yubormaydi.
 *
 * Foydalanish:
 *   node scripts/check-env.mjs                # hisobot chop etadi
 *   REQUIRE=voice,db node scripts/check-env.mjs  # kerakli rejim yo'qsa exit 1
 */

const env = process.env;

const readiness = {
  mock: true,
  voice: !!(env.OPENAI_API_KEY && env.AISHA_API_KEY),
  db: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_KEY),
  auth: !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  payment: !!(
    env.PAYME_MERCHANT_ID ||
    (env.CLICK_MERCHANT_ID && env.CLICK_SERVICE_ID)
  ),
};

const labels = {
  mock: "Kalitsiz demo (har doim ishlaydi)",
  voice: "Real ovoz aylanasi (OPENAI_API_KEY + AISHA_API_KEY)",
  db: "Ma'lumotlar bazasi (Supabase service key)",
  auth: "Google kirish (Supabase Auth anon key)",
  payment: "To'lov (Payme yoki Click)",
};

const pad = (s, n) => s + " ".repeat(Math.max(0, n - s.length));

console.log("\n  Sotuvchi Trainer — vendor tayyorligi\n");
let okCount = 0;
for (const [mode, ready] of Object.entries(readiness)) {
  const mark = ready ? "✅" : "⬜";
  if (ready) okCount++;
  console.log(`    ${mark}  ${pad(mode, 10)}  ${labels[mode]}`);
}
console.log(
  `\n  Sozlangan: ${okCount}/${Object.keys(readiness).length} rejim\n`,
);

// Ixtiyoriy: xavfsiz ulanish tekshiruvi (kalit yubormaydi).
const probes = [];
if (env.AISHA_BASE_URL) probes.push(["Aisha", env.AISHA_BASE_URL]);
if (env.NEXT_PUBLIC_SUPABASE_URL)
  probes.push(["Supabase", env.NEXT_PUBLIC_SUPABASE_URL]);

if (probes.length) {
  console.log("  Ulanish tekshiruvi (HEAD, kalitsiz):");
  await Promise.all(
    probes.map(async ([name, url]) => {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        const res = await fetch(url, {
          method: "HEAD",
          signal: ctrl.signal,
        });
        clearTimeout(t);
        console.log(`    • ${pad(name, 10)} ${res.status} ${url}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`    • ${pad(name, 10)} xato: ${msg} (${url})`);
      }
    }),
  );
  console.log("");
}

// REQUIRE ro'yxati berilgan bo'lsa — kerakli rejim sozlanganmi tekshiramiz.
const required = (env.REQUIRE || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (required.length) {
  const missing = required.filter((m) => !readiness[m]);
  if (missing.length) {
    console.error(
      `  XATO: kerakli rejim(lar) sozlanmagan: ${missing.join(", ")}\n`,
    );
    process.exit(1);
  }
  console.log("  Barcha kerakli rejimlar sozlangan.\n");
}

process.exit(0);
