import { describe, it, expect } from "vitest";
import { classifyStyle, evaluateAnswer } from "../objectionEval";
import { OBJECTION_LIBRARY } from "../objections";

describe("classifyStyle — 6 uslub", () => {
  it("yumor (emoji) aniqlaydi", () => {
    expect(classifyStyle("Arzon narsa ikki marta olinadi 😄")).toBe("yumor");
  });
  it("bosim (jur'atli/kafolat) aniqlaydi", () => {
    expect(classifyStyle("Arzimasa pulingizni to'liq qaytaraman.")).toBe(
      "bosim",
    );
  });
  it("ekspertlik (dalil/sertifikat) aniqlaydi", () => {
    expect(
      classifyStyle(
        "Sertifikat va mijoz reytingi shu yerda, raqamlar gapiradi.",
      ),
    ).toBe("ekspertlik");
  });
  it("intriga (qiziqish savoli) aniqlaydi", () => {
    expect(
      classifyStyle("Bitta narsani aytaymi, keyin o'zingiz qaror qilasiz?"),
    ).toBe("intriga");
  });
  it("dojim (muddat/keyingi qadam) aniqlaydi", () => {
    expect(classifyStyle("Qachon qayta bog'lanay — ertaga shu vaqtdami?")).toBe(
      "dojim",
    );
  });
  it("logika (qiymat/foyda) aniqlaydi", () => {
    expect(
      classifyStyle(
        "Narxni emas, qiymatni solishtiraylik va foydani hisoblaymiz.",
      ),
    ).toBe("logika");
  });
});

describe("evaluateAnswer — ball va kuchli/zaif tomon", () => {
  it("bahslashuvni past baholaydi va 'argues' zaifligini beradi", () => {
    const r = evaluateAnswer("Siz bilmaysiz, bu noto'g'ri, unaqa emas.");
    expect(r.weakness).toBe("argues");
    expect(r.score).toBeLessThan(45);
  });

  it("tan olish + qayta ramkalash + keyingi qadam yuqori ball", () => {
    const r = evaluateAnswer(
      "Tushunaman, narx muhim. Lekin qiymatni solishtiraylik — ertaga bir ulanamizmi?",
    );
    expect(r.score).toBeGreaterThanOrEqual(70);
    expect(r.strength).toBe("reframe");
    expect(r.weakness).toBe("none");
  });

  it("juda qisqa javob 'tooShort' zaifligi", () => {
    const r = evaluateAnswer("Yo'q.");
    expect(r.weakness).toBe("tooShort");
  });

  it("closing yo'q (keyingi qadam/savol yo'q) 'noClose'", () => {
    const r = evaluateAnswer(
      "Bizning mahsulotimiz juda zo'r va ishonchli mahsulot.",
    );
    expect(r.weakness).toBe("noClose");
  });

  it("ball 0..100 oralig'ida qoladi", () => {
    for (const txt of ["", "a", "?".repeat(300)]) {
      const r = evaluateAnswer(txt);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
    }
  });
});

describe("round-trip: klassifikator kutubxona teglariga mos", () => {
  it("javoblarning ko'pchiligida aniqlangan uslub yorliqqa mos keladi", () => {
    let total = 0;
    let correct = 0;
    for (const o of OBJECTION_LIBRARY) {
      for (const a of o.answers) {
        total++;
        if (classifyStyle(a.text) === a.style) correct++;
      }
    }
    // Evristika — mukammal emas (uslublar tabiiy ravishda qisman ustma-ust
    // tushadi), lekin signallar kontentga yaxshi mos bo'lishi kerak (~78%).
    expect(correct / total).toBeGreaterThanOrEqual(0.7);
  });
});
