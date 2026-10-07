/**
 * /api/session — authenticated session creation/finalization and trial status.
 * All writes use the service-role client, so ownership is checked server-side.
 */

import { NextRequest } from "next/server";
import { hasSupabase } from "@/lib/config";
import { rateLimitResponse, rejectCrossOrigin, requireAuthenticatedUser } from "@/lib/apiSecurity";
import { saveSession, completeSession, SessionCreateError } from "@/lib/db/sessions";
import { getTrialStatus, getWeakObjection, saveWeakObjection } from "@/lib/db/users";
import { TRIAL_LIMIT } from "@/lib/trial";
import { recommend } from "@/lib/coach";
import { isPersonaKey, isSohaKey } from "@/lib/content";
import { readJsonBody, parseTurns } from "@/lib/http";
import { validateScoreResult } from "@/lib/scoring";
import { xpForScore } from "@/lib/gamification";

export const runtime = "nodejs";

interface SessionBody {
  action?: "create" | "finish";
  sessionId?: unknown;
  soha?: unknown;
  persona?: unknown;
  level?: unknown;
  transcript?: unknown;
  score?: unknown;
  durationMs?: unknown;
  status?: unknown;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validLevel(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= 6;
}

export async function GET() {
  if (!hasSupabase()) {
    return Response.json({
      trialUsed: 0,
      trialLimit: TRIAL_LIMIT,
      hasActiveSubscription: true,
      weakObjection: null,
      demo: true,
    });
  }

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  const [trial, weakObjection] = await Promise.all([
    getTrialStatus(auth.userId),
    getWeakObjection(auth.userId),
  ]);
  return Response.json({ ...trial, weakObjection, demo: false });
}

export async function POST(req: NextRequest) {
  const crossOrigin = rejectCrossOrigin(req);
  if (crossOrigin) return crossOrigin;
  const parsedBody = await readJsonBody<SessionBody>(req, 256 * 1024);
  if (!parsedBody.ok) {
    return Response.json({ error: parsedBody.error }, { status: parsedBody.status });
  }
  const body = parsedBody.data;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "So'rov shakli noto'g'ri." }, { status: 400 });
  }

  const action = body.action ?? "create";
  if (action !== "create" && action !== "finish") {
    return Response.json({ error: "action noto'g'ri." }, { status: 400 });
  }

  // Kalitsiz demo: ma'lumot saqlanmasligini ochiq bildirib, real API kalitlarini
  // talab qilmaydigan mock oqimni buzmaymiz.
  if (!hasSupabase()) {
    return Response.json({ persisted: false, sessionId: null, demo: true });
  }

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const userId = auth.userId;
  const limited = rateLimitResponse(
    req,
    `session-${action}`,
    { limit: 12, windowMs: 60_000 },
    userId,
  );
  if (limited) return limited;

  if (action === "create") {
    if (
      typeof body.soha !== "string" ||
      !isSohaKey(body.soha) ||
      typeof body.persona !== "string" ||
      !isPersonaKey(body.persona)
    ) {
      return Response.json({ error: "Soha yoki persona noto'g'ri." }, { status: 400 });
    }
    const level = body.level === undefined ? 1 : body.level;
    if (!validLevel(level)) {
      return Response.json({ error: "level 1..6 oralig'ida bo'lishi kerak." }, { status: 400 });
    }

    try {
      const sessionId = await saveSession({ userId, soha: body.soha, persona: body.persona, level });
      if (!sessionId) {
        return Response.json({ error: "session_create_failed" }, { status: 503 });
      }
      return Response.json({ persisted: true, sessionId, demo: false });
    } catch (err) {
      if (err instanceof SessionCreateError && err.code === "trial_exhausted") {
        const trial = await getTrialStatus(userId);
        return Response.json({ error: "trial_exhausted", ...trial }, { status: 402 });
      }
      if (err instanceof SessionCreateError && err.code === "profile_missing") {
        return Response.json({ error: "profile_required" }, { status: 409 });
      }
      console.error("[api/session] create xato:", err instanceof Error ? err.message : err);
      return Response.json({ error: "session_create_failed" }, { status: 503 });
    }
  }

  if (typeof body.sessionId !== "string" || !UUID_RE.test(body.sessionId)) {
    return Response.json({ error: "sessionId noto'g'ri." }, { status: 400 });
  }
  const status = body.status === undefined ? "finished" : body.status;
  if (status !== "finished" && status !== "abandoned") {
    return Response.json({ error: "status noto'g'ri." }, { status: 400 });
  }
  const durationMs = body.durationMs ?? null;
  if (
    durationMs !== null &&
    (typeof durationMs !== "number" || !Number.isInteger(durationMs) || durationMs < 0 || durationMs > 4 * 60 * 60 * 1000)
  ) {
    return Response.json({ error: "durationMs noto'g'ri." }, { status: 400 });
  }

  if (status === "finished") {
    const parsedTurns = parseTurns(body.transcript);
    if (!parsedTurns.ok) {
      return Response.json({ error: parsedTurns.error }, { status: parsedTurns.status });
    }
    if (parsedTurns.turns.length === 0) {
      return Response.json({ error: "Bo'sh transkript." }, { status: 400 });
    }
    const validatedScore = validateScoreResult(body.score);
    if (!validatedScore) {
      return Response.json({ error: "Baho formati noto'g'ri." }, { status: 400 });
    }

    const level = validLevel(body.level) ? body.level : 1;
    const score = {
      ...validatedScore,
      xp_awarded: xpForScore(validatedScore.total, {
        closed: validatedScore.closed,
        personaLevel: level,
      }),
    };

    const completed = await completeSession({
      sessionId: body.sessionId,
      userId,
      status,
      durationMs,
      transcript: parsedTurns.turns,
      score,
    });
    if (completed === "not_found") {
      return Response.json({ error: "session_not_found_or_closed" }, { status: 404 });
    }
    if (completed !== "ok") {
      return Response.json({ error: "session_finish_failed" }, { status: 503 });
    }

    const { focusObjection } = recommend(parsedTurns.turns, score.breakdown);
    void saveWeakObjection(userId, focusObjection);
  } else {
    const completed = await completeSession({
      sessionId: body.sessionId,
      userId,
      status,
      durationMs,
      transcript: [],
      score: null,
    });
    if (completed === "not_found") {
      return Response.json({ error: "session_not_found_or_closed" }, { status: 404 });
    }
    if (completed !== "ok") {
      return Response.json({ error: "session_finish_failed" }, { status: 503 });
    }
  }

  return Response.json({ persisted: true, sessionId: body.sessionId, demo: false });
}
