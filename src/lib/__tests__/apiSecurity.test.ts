import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "../apiSecurity";

describe("InMemoryRateLimiter", () => {
  it("limit ichidagi so'rovlarni ruxsat qiladi, keyingisini bloklaydi", () => {
    const limiter = new InMemoryRateLimiter();
    const policy = { limit: 2, windowMs: 1_000 };

    expect(limiter.consume("user:a", policy, 10_000).allowed).toBe(true);
    expect(limiter.consume("user:a", policy, 10_100).allowed).toBe(true);
    expect(limiter.consume("user:a", policy, 10_200)).toEqual({
      allowed: false,
      retryAfterSeconds: 1,
    });
  });

  it("oyna tugagach limitni qayta ochadi", () => {
    const limiter = new InMemoryRateLimiter();
    const policy = { limit: 1, windowMs: 1_000 };

    expect(limiter.consume("user:a", policy, 10_000).allowed).toBe(true);
    expect(limiter.consume("user:a", policy, 11_001).allowed).toBe(true);
  });

  it("turli identity'larni alohida hisoblaydi", () => {
    const limiter = new InMemoryRateLimiter();
    const policy = { limit: 1, windowMs: 1_000 };

    expect(limiter.consume("user:a", policy, 10_000).allowed).toBe(true);
    expect(limiter.consume("user:b", policy, 10_000).allowed).toBe(true);
  });
});
