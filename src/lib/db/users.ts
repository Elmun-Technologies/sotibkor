/**
 * Foydalanuvchi DB operatsiyalari (server-only).
 * self-hosted Postgres (src/lib/db/pg.ts) ustida ishlaydi.
 *
 * Rol mapping: ilova ichida Role = "menejer" | "rop", DB'da esa
 * users.role = "sotuvchi" | "boshliq" (docs/ARCHITECTURE.md sxemasi).
 *   menejer <-> sotuvchi,  rop <-> boshliq.
 *
 * DB sozlanmagan bo'lsa (DATABASE_URL yo'q) — funksiyalar xato tashlaydi,
 * chunki auth uchun DB majburiy (mock emas).
 */

import "server-only";
import { query } from "@/lib/db/pg";
import type { Role } from "@/lib/auth";

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  password_hash: string;
}

interface Row {
  id: string;
  email: string;
  full_name: string;
  role: string;
  password_hash: string;
}

function toRole(dbRole: string): Role {
  return dbRole === "boshliq" ? "rop" : "menejer";
}

function fromRole(role: Role): string {
  return role === "rop" ? "boshliq" : "sotuvchi";
}

function mapRow(r: Row): DbUser {
  return {
    id: r.id,
    email: r.email,
    full_name: r.full_name,
    role: toRole(r.role),
    password_hash: r.password_hash,
  };
}

const COLS = "id, email, full_name, role, password_hash";

/** Email bo'yicha foydalanuvchini topadi (lower-case solishtirish). */
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const res = await query<Row>(
    "select " + COLS + " from users where lower(email) = lower($1) limit 1",
    [email],
  );
  if (!res) throw new Error("DB sozlanmagan (DATABASE_URL yo'q).");
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}

/** Yangi foydalanuvchi yaratadi. Email band bo'lsa null qaytaradi. */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
}): Promise<DbUser | null> {
  const exists = await findUserByEmail(input.email);
  if (exists) return null;

  const res = await query<Row>(
    "insert into users (email, password_hash, full_name, role) " +
      "values ($1, $2, $3, $4) returning " + COLS,
    [
      input.email.toLowerCase(),
      input.passwordHash,
      input.fullName,
      fromRole(input.role),
    ],
  );
  if (!res) throw new Error("DB sozlanmagan (DATABASE_URL yo'q).");
  return res.rows[0] ? mapRow(res.rows[0]) : null;
}
