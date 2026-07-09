/**
 * PostgreSQL klienti — self-hosted (Contabo) uchun.
 *
 * Qat'iy qoidalar (CLAUDE.md §3):
 * - Ulanish satri FAQAT process.env.DATABASE_URL dan (server-only).
 * - DATABASE_URL bo'lmasa (mock rejim) — HECH QAChON tashlab yuborilmaydi,
 *   `null` qaytadi. Chaqiruvchi kod `null` ni jimgina no-op sifatida qabul qiladi.
 *
 * Server route'larida (src/app/api) ishlatiladi; brauzerga hech qachon chiqmaydi.
 */

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

/** DATABASE_URL sozlanganmi? */
export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Umumiy Pool. DATABASE_URL yo'q bo'lsa `null` (mock rejim).
 * Pool bir marta yaratiladi va qayta ishlatiladi (serverless'da ham).
 */
export function getPool(): Pool | null {
  if (!hasDb()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Contabo'da TLS ixtiyoriy — PGSSL=require bo'lsa yoqiladi.
      ssl:
        process.env.PGSSL === "require"
          ? { rejectUnauthorized: false }
          : undefined,
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

/**
 * Parametrlangan so'rov (SQL injection'dan himoya).
 * DB yo'q bo'lsa `null` qaytaradi (mock rejim — chaqiruvchi hal qiladi).
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<{ rows: T[]; rowCount: number } | null> {
  const p = getPool();
  if (!p) return null;
  const res = await p.query<T>(text, params);
  return { rows: res.rows, rowCount: res.rowCount ?? 0 };
}
