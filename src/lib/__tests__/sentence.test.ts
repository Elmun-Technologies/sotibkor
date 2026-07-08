import { describe, expect, it } from "vitest";
import { SentenceStreamer } from "../sentence";

describe("SentenceStreamer", () => {
  it("bitta to'liq gapni push'da chiqaradi", () => {
    const sp = new SentenceStreamer();
    expect(sp.push("Salom aleykum.")).toEqual(["Salom aleykum."]);
  });

  it("gap tugamaguncha hech narsa chiqarmaydi", () => {
    const sp = new SentenceStreamer();
    expect(sp.push("Salom")).toEqual([]);
    expect(sp.push(" aleykum")).toEqual([]);
    expect(sp.push(", qalaysiz?")).toEqual(["Salom aleykum, qalaysiz?"]);
  });

  it("bir push ichida bir nechta gapni ajratadi", () => {
    const sp = new SentenceStreamer();
    expect(sp.push("Birinchi. Ikkinchi! Uchinchi?")).toEqual([
      "Birinchi.",
      "Ikkinchi!",
      "Uchinchi?",
    ]);
  });

  it("gaplar bo'laklab kelganda ham to'g'ri yig'adi", () => {
    const sp = new SentenceStreamer();
    const out: string[] = [];
    for (const chunk of ["Ob", "bo qim", "mat-ku bu. Chegir", "ma yo'qmi?"]) {
      out.push(...sp.push(chunk));
    }
    expect(out).toEqual(["Obbo qimmat-ku bu.", "Chegirma yo'qmi?"]);
  });

  it("ko'p nuqta (…) va ellipsisni gap oxiri deb qabul qiladi", () => {
    const sp = new SentenceStreamer();
    expect(sp.push("Hmm… mayli.")).toEqual(["Hmm…", "mayli."]);
  });

  it("flush qolgan tugallanmagan matnni qaytaradi", () => {
    const sp = new SentenceStreamer();
    sp.push("To'liq gap. Yarim");
    expect(sp.flush()).toEqual(["Yarim"]);
    // flush'dan keyin buffer bo'sh.
    expect(sp.flush()).toEqual([]);
  });

  it("flush bo'sh buferda bo'sh massiv qaytaradi", () => {
    const sp = new SentenceStreamer();
    sp.push("Hammasi tugadi.");
    expect(sp.flush()).toEqual([]);
  });
});
