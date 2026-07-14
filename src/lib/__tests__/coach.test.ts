import { describe, it, expect } from "vitest";
import {
  classifyObjection,
  interestScore,
  interestSeries,
  stageCoverage,
  objectionHistogram,
  recommend,
  liveHint,
  OBJECTION_TYPES,
  FUNNEL_STAGES,
  type Turn,
} from "../coach";

describe("classifyObjection", () => {
  it("narx e'tirozini aniqlaydi", () => {
    expect(classifyObjection("Qimmat-ku, chegirma yo'qmi?")).toBe("narx");
  });
  it("ishonch e'tirozini aniqlaydi", () => {
    expect(classifyObjection("Original o'zimi? Kafolat bormi?")).toBe(
      "ishonch",
    );
  });
  it("vaqt e'tirozini aniqlaydi", () => {
    expect(classifyObjection("Vaqtim yo'q, keyin")).toBe("vaqt");
  });
  it("aralash (rus) so'zni ham tushunadi", () => {
    expect(classifyObjection("Podumayu, keyinroq")).toBe("qaror");
  });
  it("e'tirozsiz gapga null", () => {
    expect(classifyObjection("ha eshitaman")).toBeNull();
  });
});

describe("interestScore", () => {
  it("bo'sh transkriptda bazaviy qiymat", () => {
    expect(interestScore([])).toBe(48);
  });
  it("ochiq savol + qiymat tili qiziqishni oshiradi", () => {
    const t: Turn[] = [
      { role: "user", content: "Sizga qanaqa divan kerak? Kafolat muhimmi?" },
    ];
    expect(interestScore(t)).toBeGreaterThan(48);
  });
  it("darrov chegirma qiziqishni tushiradi", () => {
    const t: Turn[] = [
      { role: "user", content: "Mayli senga chegirma qilaman" },
    ];
    expect(interestScore(t)).toBeLessThan(48);
  });
  it("0..100 oralig'ida qoladi", () => {
    const spam: Turn[] = Array.from({ length: 30 }, () => ({
      role: "user" as const,
      content: "kafolat foyda sifat xizmat? keling kelishamiz",
    }));
    const v = interestScore(spam);
    expect(v).toBeLessThanOrEqual(100);
    expect(v).toBeGreaterThanOrEqual(0);
  });
});

describe("interestSeries", () => {
  it("har sotuvchi turn uchun bitta nuqta", () => {
    const t: Turn[] = [
      { role: "user", content: "Salom?" },
      { role: "assistant", content: "Ha" },
      { role: "user", content: "Kafolat bor?" },
    ];
    expect(interestSeries(t)).toHaveLength(2);
  });
});

describe("stageCoverage", () => {
  it("barcha bosqichlar 0..1", () => {
    const t: Turn[] = [
      {
        role: "user",
        content: "Assalomu alaykum, men kompaniyadanman. Nima qidiryapsiz?",
      },
      { role: "assistant", content: "Qimmat-ku" },
      { role: "user", content: "Tushunaman, lekin kafolat bor. Kelishamiz?" },
    ];
    const c = stageCoverage(t);
    for (const s of FUNNEL_STAGES) {
      expect(c[s]).toBeGreaterThanOrEqual(0);
      expect(c[s]).toBeLessThanOrEqual(1);
    }
    expect(c.yopish).toBe(1);
  });
});

describe("objectionHistogram + recommend", () => {
  it("mijoz e'tirozlarini sanaydi", () => {
    const t: Turn[] = [
      { role: "assistant", content: "Qimmat-ku" },
      { role: "assistant", content: "Boshqa joyda arzon" },
      { role: "user", content: "tushunaman" },
    ];
    const h = objectionHistogram(t);
    expect(h.narx).toBeGreaterThanOrEqual(1);
    OBJECTION_TYPES.forEach((ty) => expect(h[ty]).toBeGreaterThanOrEqual(0));
  });

  it("breakdown bo'lsa eng zaif bosqichni topadi", () => {
    const rec = recommend([], {
      salomlashish: 9,
      ehtiyoj_aniqlash: 18,
      otkazlarga_ishlov: 6,
      closing: 18,
      ohang: 18,
    });
    expect(rec.weakestStage).toBe("etiroz");
    expect(rec.message).toContain("e'tiroz");
  });
});

describe("liveHint (jonli murabbiy — 10x-2)", () => {
  it("bo'sh transkript uchun null", () => {
    expect(liveHint([])).toBeNull();
  });

  it("birinchi repликada chegirma taklif qilinsa — discountTooEarly", () => {
    const h = liveHint([
      { role: "user", content: "Sizga chegirma qilaman, mayli" },
    ]);
    expect(h?.key).toBe("discountTooEarly");
    expect(h?.tone).toBe("bad");
  });

  it("ehtiyoj aniqlanmasdan narx aytilsa — priceTooEarly", () => {
    const h = liveHint([{ role: "user", content: "Narxi 500 ming so'm" }]);
    expect(h?.key).toBe("priceTooEarly");
    expect(h?.tone).toBe("warn");
  });

  it("bir necha repликadan keyin ochiq savol yo'q bo'lsa — needsOpenQuestion", () => {
    const h = liveHint([
      { role: "user", content: "Salom, men Aziz" },
      { role: "assistant", content: "Ha, eshityapman" },
      { role: "user", content: "Mahsulotimiz juda yaxshi" },
      { role: "assistant", content: "Davom eting" },
      { role: "user", content: "Sifatli va ishonchli" },
    ]);
    expect(h?.key).toBe("needsOpenQuestion");
  });

  it("juda uzun monolog bo'lsa — tooLongMonologue", () => {
    const long = Array(65).fill("gap").join(" ");
    const h = liveHint([{ role: "user", content: long }]);
    expect(h?.key).toBe("tooLongMonologue");
  });

  it("juda qisqa javob (2-repликadan keyin) — tooShortReply", () => {
    const h = liveHint([
      { role: "user", content: "Salom, qandaysiz?" },
      { role: "assistant", content: "Zo'r, davom eting" },
      { role: "user", content: "Ha albatta" },
    ]);
    expect(h?.key).toBe("tooShortReply");
  });

  it("savol + qiymat tili birga kelsa — goodPace", () => {
    const h = liveHint([
      { role: "user", content: "Kafolat qancha muddatga beriladi?" },
    ]);
    expect(h?.key).toBe("goodPace");
    expect(h?.tone).toBe("good");
  });

  it("hech qanday signal bo'lmasa — null", () => {
    const h = liveHint([
      { role: "user", content: "Yaxshi mahsulot ko'rsatib bering" },
    ]);
    expect(h).toBeNull();
  });
});
