import { describe, expect, it } from "vitest";
import { buildWarnings, mantraSlots, newBuild, powerFor, talentAvailability, totalStats } from "./build";
import { MANTRAS, OATHS, RULES, TALENTS, TALENT_BY_ID } from "./game";
import { decodeBuild, encodeBuild } from "./share";

describe("game data", () => {
  it("has unique ids and parseable requirements", () => {
    for (const list of [TALENTS, MANTRAS, OATHS]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("build model", () => {
  it("derives power from points spent", () => {
    expect(powerFor(0)).toBe(0);
    expect(powerFor(14)).toBe(0);
    expect(powerFor(15)).toBe(1);
    expect(powerFor(RULES.totalPoints)).toBe(RULES.maxPower);
  });

  it("adds racial bonuses to totals", () => {
    const b = { ...newBuild(), race: "gremor" };
    b.invested.STR = 10;
    expect(totalStats(b).STR).toBe(12);
    expect(totalStats(b).FTD).toBe(3);
  });

  it("gates origin talents on the origin", () => {
    const t = TALENT_BY_ID["justicar-whistle"];
    expect(talentAvailability(t, newBuild()).met).toBe(false);
    expect(talentAvailability(t, { ...newBuild(), origin: "justicar" }).met).toBe(true);
  });

  it("overflows mantras into the wildcard slot", () => {
    const b = { ...newBuild(), mantras: ["fire-palm", "ice-lance", "gale-punch", "darkblade"] };
    const { used, overflow } = mantraSlots(b);
    expect(used.combat).toBe(3);
    expect(used.wildcard).toBe(1);
    expect(overflow).toEqual([]);
  });

  it("warns about unmet selections", () => {
    const b = { ...newBuild(), oath: "jetstriker", talents: ["ghost"] };
    expect(buildWarnings(b)).toHaveLength(2);
  });
});

describe("share codes", () => {
  it("round-trips a build", () => {
    const b = { ...newBuild(), name: "Frost ⚔ Knight", race: "etrean", oath: "blindseer", talents: ["ghost"], mantras: ["ice-lance"] };
    b.invested.WLL = 40;
    b.invested.ICE = 60;
    expect(decodeBuild(encodeBuild(b))).toEqual(b);
  });

  it("rejects garbage", () => {
    expect(decodeBuild("not-a-build")).toBeNull();
  });
});
