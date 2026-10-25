import { describe, expect, it } from "vitest";
import { emptyStats } from "../data/stats";
import { evaluate, formatReq, parseReq, reqStats } from "./requirements";

const ctx = (patch: Partial<ReturnType<typeof emptyStats>> = {}, power = 0) => ({
  stats: { ...emptyStats(), ...patch },
  power,
  pointsPerPower: 15,
});

describe("parseReq", () => {
  it("parses empty as none", () => {
    expect(parseReq("")).toEqual({ kind: "none" });
    expect(parseReq("   ")).toEqual({ kind: "none" });
  });

  it("parses single stats, combos and power", () => {
    expect(parseReq("STR 25")).toEqual({ kind: "stat", stat: "STR", min: 25 });
    expect(parseReq("comb(STR, FTD,WLL) 40")).toEqual({ kind: "comb", stats: ["STR", "FTD", "WLL"], min: 40 });
    expect(parseReq("LVL 15")).toEqual({ kind: "power", min: 15 });
  });

  it("gives & higher precedence than |", () => {
    const r = parseReq("STR 10 & AGL 10 | CHA 10");
    expect(r.kind).toBe("any");
  });

  it("supports grouping", () => {
    const r = parseReq("comb(HVY,MED,LHT) 75 & STR 25 & (AGL 25 | CHA 25)");
    expect(r.kind).toBe("all");
    expect(reqStats(r).sort()).toEqual(["AGL", "CHA", "HVY", "LHT", "MED", "STR"]);
  });

  it("rejects bad input", () => {
    expect(() => parseReq("XYZ 10")).toThrow();
    expect(() => parseReq("STR")).toThrow();
    expect(() => parseReq("STR 10 &")).toThrow();
    expect(() => parseReq("(STR 10")).toThrow();
  });
});

describe("evaluate", () => {
  const silentheart = parseReq("comb(HVY,MED,LHT) 75 & STR 25 & (AGL 25 | CHA 25)");

  it("reports met requirements", () => {
    expect(evaluate(silentheart, ctx({ MED: 75, STR: 25, CHA: 30 })).met).toBe(true);
  });

  it("sums shortfalls and picks the cheapest OR branch", () => {
    const e = evaluate(silentheart, ctx({ MED: 70, STR: 20, AGL: 20, CHA: 10 }));
    expect(e.met).toBe(false);
    expect(e.cost).toBe(5 + 5 + 5);
    expect(e.missing).toEqual(["HVY/MED/LHT +5", "STR +5", "AGL +5"]);
  });

  it("costs power requirements in points", () => {
    const e = evaluate(parseReq("LVL 15"), ctx({}, 12));
    expect(e).toMatchObject({ met: false, cost: 45, missing: ["Power 15"] });
  });
});

describe("formatReq", () => {
  it("renders readable text", () => {
    expect(formatReq(parseReq("STR 25 & (AGL 25 | CHA 25)"))).toBe("25 Strength + (25 Agility or 25 Charisma)");
  });
});
