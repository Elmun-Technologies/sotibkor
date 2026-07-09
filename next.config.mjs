/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dokploy/Docker uchun: .next/standalone ichida minimal, o'zida ishlaydigan
  // server.js yig'iladi (node_modules'ni to'liq nusxalash shart emas).
  output: "standalone",
};

export default nextConfig;
