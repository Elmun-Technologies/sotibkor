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

describe("SentenceStreamer earlyFirst (TTFB optimizatsiyasi)", () => {
  it("gap tugamasdan birinchi bo'lakni vergul chegarasida erta chiqaradi", () => {
    const sp = new SentenceStreamer({ earlyFirst: true });
    // Oqim hali gap oxiriga yetmadi, lekin vergul keldi (≥14 belgi) — birinchi
    // parcha darrov chiqadi (TTFB uchun), butun gap kutilmaydi.
    expect(sp.push("Assalomu alaykum, ")).toEqual(["Assalomu alaykum,"]);
    expect(sp.push("eshityapman sizni.")).toEqual(["eshityapman sizni."]);
  });

  it("faqat BIRINCHI bo'lakka ta'sir qiladi — keyingilar to'liq gap chegarasida", () => {
    const sp = new SentenceStreamer({ earlyFirst: true });
    const out: string[] = [];
    out.push(...sp.push("Yaxshi keldingiz, ")); // birinchi: vergulda erta
    out.push(...sp.push("xush kelibsiz. Ikkinchi, uchinchi bo'lak.")); // to'liq gaplar
    expect(out[0]).toBe("Yaxshi keldingiz,");
    expect(out).toContain("xush kelibsiz.");
    // Ikkinchi gapdagi vergulda EMAS — butun gap chiqadi.
    expect(out).toContain("Ikkinchi, uchinchi bo'lak.");
  });

  it("qisqa (min'dan kalta) birinchi bo'lakni erta chiqarmaydi", () => {
    const sp = new SentenceStreamer({ earlyFirst: true });
    // "Ha, mayli" — vergulgacha 2 belgi (<14), erta chiqmaydi.
    expect(sp.push("Ha, mayli bo'ladi.")).toEqual(["Ha, mayli bo'ladi."]);
  });

  it("earlyFirst o'chiq bo'lsa (standart) xatti-harakat o'zgarmaydi", () => {
    const sp = new SentenceStreamer();
    expect(sp.push("Assalomu alaykum, eshityapman sizni.")).toEqual([
      "Assalomu alaykum, eshityapman sizni.",
    ]);
  });
});
