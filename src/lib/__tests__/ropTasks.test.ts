import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getRopAssignments,
  assignRopTask,
  removeRopAssignment,
  assignmentsForMember,
} from "../ropTasks";

// localStorage stubi (node env — window yo'q). ropTasks `typeof window` ni
// tekshiradi, shuning uchun window ham global qilib beriladi.
function makeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  const ls = makeStorage();
  vi.stubGlobal("window", { localStorage: ls });
  vi.stubGlobal("localStorage", ls);
});

const base = {
  focus: "narx" as const,
  target: 5,
  atIso: "2026-07-15T10:00:00.000Z",
};

describe("assignRopTask", () => {
  it("yangi topshiriqni saqlaydi va eng yangisini birinchi qo'yadi", () => {
    assignRopTask({ member: "Aziz", title: "Narxni yop", ...base });
    const list = assignRopTask({
      member: "Dilnoza",
      title: "Vaqtni yop",
      ...base,
      atIso: "2026-07-15T11:00:00.000Z",
    });
    expect(list).toHaveLength(2);
    expect(list[0].member).toBe("Dilnoza"); // eng yangisi birinchi
    expect(getRopAssignments()).toHaveLength(2);
  });

  it("sarlavhani trim qiladi va targetni kamida 1 ga normallashtiradi", () => {
    const [entry] = assignRopTask({
      member: "Sardor",
      title: "  Ishonchni oshir  ",
      focus: "ishonch",
      target: 0,
      atIso: base.atIso,
    });
    expect(entry.title).toBe("Ishonchni oshir");
    expect(entry.target).toBe(1);
  });
});

describe("removeRopAssignment", () => {
  it("id bo'yicha o'chiradi", () => {
    const [a] = assignRopTask({ member: "Aziz", title: "A", ...base });
    const after = removeRopAssignment(a.id);
    expect(after).toHaveLength(0);
    expect(getRopAssignments()).toHaveLength(0);
  });
});

describe("assignmentsForMember", () => {
  it("ismni katta-kichik harfsiz solishtiradi", () => {
    assignRopTask({ member: "Aziz", title: "A", ...base });
    assignRopTask({ member: "Dilnoza", title: "D", ...base });
    expect(assignmentsForMember("aziz")).toHaveLength(1);
    expect(assignmentsForMember("  AZIZ ")).toHaveLength(1);
    expect(assignmentsForMember("Nodira")).toHaveLength(0);
  });
});

describe("getRopAssignments", () => {
  it("buzuq JSON'da bo'sh ro'yxat qaytaradi", () => {
    localStorage.setItem("sotibkor_rop_assignments", "{buzuq");
    expect(getRopAssignments()).toEqual([]);
  });
});
