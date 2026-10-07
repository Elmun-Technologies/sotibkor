import { describe, expect, it } from "vitest";
import { GET as getStats } from "@/app/api/stats/route";
import { GET as getLeaderboard } from "@/app/api/leaderboard/route";
import { GET as getTeamStats } from "@/app/api/team-stats/route";

describe("preview analytics endpoints", () => {
  it("user statistics are explicitly marked as demo", async () => {
    const response = await getStats();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ demo: true, xp: expect.any(Number) });
  });

  it("leaderboard is explicitly marked as demo", async () => {
    const response = await getLeaderboard();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ demo: true, entries: expect.any(Array) });
  });

  it("team statistics are explicitly marked as demo", async () => {
    const response = await getTeamStats();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ demo: true, team: expect.any(Array) });
  });
});
