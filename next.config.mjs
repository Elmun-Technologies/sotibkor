/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Next bootstrap + tema-init inline skripti uchun
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "media-src 'self' blob:",
      // Supabase Auth (Google OAuth) brauzer tomonidan cross-origin fetch/qo'ng'iroq qiladi
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Ilova mikrofon orqali mashq qiladi; kamera/geolokatsiya esa kerak emas.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  // Faqat HTTPS orqali yetkazilganda ishlaydi (Dokploy/TLS ostida).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig = {
  // Dokploy/Docker uchun: .next/standalone ichida minimal, o'zida ishlaydigan
  // server.js yig'iladi (node_modules'ni to'liq nusxalash shart emas).
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Eski/kutilgan yo'l nomi — haqiqiy sahifa /dars.
      { source: "/trening", destination: "/dars", permanent: true },
    ];
  },
};

export default nextConfig;
