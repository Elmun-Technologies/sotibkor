import { describe, expect, it } from "vitest";
import { extFromMime } from "../audioStorage";

describe("extFromMime (arxiv audio kengaytmasi)", () => {
  it("webm'ni taniydi", () => {
    expect(extFromMime("audio/webm")).toBe("webm");
    expect(extFromMime("audio/webm;codecs=opus")).toBe("webm");
  });

  it("mp3/mpeg'ni taniydi", () => {
    expect(extFromMime("audio/mpeg")).toBe("mp3");
    expect(extFromMime("audio/mp3")).toBe("mp3");
  });

  it("wav/ogg/m4a'ni taniydi", () => {
    expect(extFromMime("audio/wav")).toBe("wav");
    expect(extFromMime("audio/ogg")).toBe("ogg");
    expect(extFromMime("audio/mp4")).toBe("m4a");
  });

  it("katta-kichik harfga sezgir emas", () => {
    expect(extFromMime("AUDIO/WEBM")).toBe("webm");
  });

  it("noma'lum turlar uchun 'bin' qaytaradi", () => {
    expect(extFromMime("application/octet-stream")).toBe("bin");
    expect(extFromMime("")).toBe("bin");
  });
});
