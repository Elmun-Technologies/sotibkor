import { describe, it, expect } from "vitest";
import {
  teamAvgScore,
  teamProgress,
  teamFunnelAverage,
  teamWeakestStage,
  weakObjectionRanking,
  rankByScore,
  activityBucket,
} from "../team";
import type { TeamRow } from "../types";

const TEAM: TeamRow[] = [
  {
    name: "Aziz",
    done: 8,
    target: 10,
    avg: 74,
    streakDays: 5,
    lastActiveHours: 2,
    funnel: {
      kontakt: 90,
      ehtiyoj: 80,
      prezentatsiya: 70,
      etiroz: 50,
      yopish: 40,
    },
    weakObjection: "narx",
  },
  {
    name: "Dilnoza",
    done: 10,
    target: 10,
    avg: 82,
    streakDays: 9,
    lastActiveHours: 1,
    funnel: {
      kontakt: 100,
      ehtiyoj: 90,
      prezentatsiya: 80,
      etiroz: 70,
      yopish: 60,
    },
    weakObjection: "qaror",
  },
  {
    name: "Sardor",
    done: 4,
    target: 10,
    avg: 60,
    streakDays: 2,
    lastActiveHours: 27,
    funnel: {
      kontakt: 80,
      ehtiyoj: 60,
      prezentatsiya: 40,
      etiroz: 30,
      yopish: 20,
    },
    weakObjection: "narx",
  },
];

describe("teamAvgScore", () => {
  it("o'rtacha ballni yaxlitlaydi", () => {
    expect(teamAvgScore(TEAM)).toBe(72); // (74+82+60)/3 = 72
  });
  it("bo'sh jamoada 0", () => {
    expect(teamAvgScore([])).toBe(0);
  });
});

describe("teamProgress", () => {
  it("bajarilgan/maqsad yig'indisi", () => {
    expect(teamProgress(TEAM)).toEqual({ done: 22, target: 30 });
  });
});

describe("teamFunnelAverage", () => {
  it("har bosqich bo'yicha o'rtacha", () => {
    const avg = teamFunnelAverage(TEAM);
    expect(avg.kontakt).toBe(90); // (90+100+80)/3
    expect(avg.yopish).toBe(40); // (40+60+20)/3
  });
});

describe("teamWeakestStage", () => {
  it("eng past o'rtacha qamrovli bosqich", () => {
    // yopish o'rtacha 40 — eng past.
    expect(teamWeakestStage(TEAM)).toBe("yopish");
  });
  it("bo'sh jamoada null", () => {
    expect(teamWeakestStage([])).toBeNull();
  });
});

describe("weakObjectionRanking", () => {
  it("takrorlanish bo'yicha kamayish tartibida", () => {
    const r = weakObjectionRanking(TEAM);
    expect(r[0]).toEqual({ type: "narx", count: 2 }); // Aziz + Sardor
    expect(r).toContainEqual({ type: "qaror", count: 1 });
  });
  it("null zaif nuqtalar hisobga olinmaydi", () => {
    const withNull: TeamRow[] = [{ ...TEAM[0], weakObjection: null }];
    expect(weakObjectionRanking(withNull)).toEqual([]);
  });
});

describe("rankByScore", () => {
  it("o'rtacha ball kamayishi bo'yicha, asl massivni o'zgartirmaydi", () => {
    const ranked = rankByScore(TEAM);
    expect(ranked.map((m) => m.name)).toEqual(["Dilnoza", "Aziz", "Sardor"]);
    expect(TEAM[0].name).toBe("Aziz"); // asl tartib buzilmadi
  });
});

describe("activityBucket", () => {
  it("<1 soat — hozir", () => {
    expect(activityBucket(0)).toEqual({ key: "hozir", n: 0 });
  });
  it("soatlarda", () => {
    expect(activityBucket(3)).toEqual({ key: "soat", n: 3 });
    expect(activityBucket(23)).toEqual({ key: "soat", n: 23 });
  });
  it("24-47 soat — kecha", () => {
    expect(activityBucket(27)).toEqual({ key: "kecha", n: 1 });
  });
  it("48+ soat — kunlarda", () => {
    expect(activityBucket(50)).toEqual({ key: "kun", n: 2 });
    expect(activityBucket(72)).toEqual({ key: "kun", n: 3 });
  });
});
