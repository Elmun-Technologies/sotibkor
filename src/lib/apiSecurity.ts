/**
 * API route'lar uchun minimal server-side himoya.
 * Rate limiter xotirada ishlaydi va bir nusxali Dokploy deploy uchun foydali;
 * bir nechta replica/serverless bo'lsa, uni Redis/WAF kabi umumiy store bilan almashtirish kerak.
 */

import { hasSupabaseAuth } from "@/lib/config";
import { currentUserId } from "@/lib/supabase/user";

export type AuthResult =
  | { userId: string; response: null }
  | { userId: null; response: Response };

/** Paid provider yoki service-role DB amali uchun haqiqiy Supabase sessiyasini talab qiladi. */
export async function requireAuthenticatedUser(): Promise<AuthResult> {
  if (!hasSupabaseAuth()) {
    return {
      userId: null,
      response: Response.json(
        { error: "auth_not_configured" },
        { status: 503 },
      ),
    };
  }

  const userId = await currentUserId();
  if (!userId) {
    return {
      userId: null,
      response: Response.json({ error: "unauthorized" }, { status: 401 }),
    };
  }
  return { userId, response: null };
}

export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
}

interface Bucket {
  hits: number[];
  windowMs: number;
  touchedAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** Testlash mumkin bo'lgan, cheklangan hajmli sliding-window limiter. */
export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private calls = 0;
  private readonly maxBuckets: number;

  constructor(maxBuckets = 20_000) {
    this.maxBuckets = maxBuckets;
  }

  consume(
    key: string,
    policy: RateLimitPolicy,
    now = Date.now(),
  ): RateLimitResult {
    const cutoff = now - policy.windowMs;
    const bucket = this.buckets.get(key) ?? {
      hits: [],
      windowMs: policy.windowMs,
      touchedAt: now,
    };
    bucket.hits = bucket.hits.filter((at) => at > cutoff);
    bucket.windowMs = policy.windowMs;
    bucket.touchedAt = now;

    if (bucket.hits.length >= policy.limit) {
      this.buckets.set(key, bucket);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((bucket.hits[0] + policy.windowMs - now) / 1000),
        ),
      };
    }

    bucket.hits.push(now);
    this.buckets.set(key, bucket);
    this.calls++;
    if (this.calls % 128 === 0 || this.buckets.size > this.maxBuckets) {
      this.prune(now);
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private prune(now: number): void {
    for (const [key, bucket] of Array.from(this.buckets.entries())) {
      if (bucket.hits.every((at) => at <= now - bucket.windowMs)) {
        this.buckets.delete(key);
      }
    }
    if (this.buckets.size <= this.maxBuckets) return;

    const oldest = Array.from(this.buckets.entries())
      .sort((a, b) => a[1].touchedAt - b[1].touchedAt)
      .slice(0, this.buckets.size - this.maxBuckets);
    for (const [key] of oldest) this.buckets.delete(key);
  }
}

const globalWithLimiter = globalThis as typeof globalThis & {
  __sotibkorRateLimiter?: InMemoryRateLimiter;
};
const limiter =
  globalWithLimiter.__sotibkorRateLimiter ??
  (globalWithLimiter.__sotibkorRateLimiter = new InMemoryRateLimiter());

function requestAddress(request: Request): string {
  // Paid endpointlarda `userId` ishlatiladi; IP faqat kalitsiz demo rejimida.
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/** Limit oshsa 429 response qaytaradi; aks holda null. */
export function rateLimitResponse(
  request: Request,
  scope: string,
  policy: RateLimitPolicy,
  userId: string | null = null,
): Response | null {
  const identity = userId ? `user:${userId}` : `ip:${requestAddress(request)}`;
  const result = limiter.consume(`${scope}:${identity}`, policy);
  if (result.allowed) return null;

  return Response.json(
    { error: "rate_limited", retryAfterSeconds: result.retryAfterSeconds },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Cookie-authenticated POST'lar uchun oddiy CSRF himoyasi. Origin yuborilmagan server-to-server so'rovlarga ruxsat qoladi. */
export function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  try {
    if (new URL(origin).origin === new URL(request.url).origin) return null;
  } catch {
    // Noto'g'ri Origin ham cross-origin kabi rad etiladi.
  }
  return Response.json({ error: "cross_origin_request_denied" }, { status: 403 });
}

/** Content-Length mavjud bo'lsa, qimmat formData parse'dan oldin cheklaydi. */
export function declaredBodyTooLarge(request: Request, maxBytes: number): boolean {
  const raw = request.headers.get("content-length");
  if (!raw) return false;
  const size = Number(raw);
  return Number.isFinite(size) && size > maxBytes;
}
