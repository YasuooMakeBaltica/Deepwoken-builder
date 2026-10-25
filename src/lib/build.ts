import { emptyStats, STAT_KEYS, type Stats } from "../data/stats";
import { evaluate, type EvalContext, type Evaluation, type Req } from "./requirements";
import {
  MANTRA_BY_ID,
  OATH_BY_ID,
  RACE_BY_ID,
  RULES,
  TALENT_BY_ID,
  type Mantra,
  type MantraCategory,
  type Talent,
} from "./game";

export interface Build {
  name: string;
  /** Points invested by the player (excludes racial bonuses). */
  invested: Stats;
  race: string;
  origin: string;
  oath: string;
  murmur: string;
  bell: string;
  boons: string[];
  flaws: string[];
  talents: string[];
  mantras: string[];
}

export const newBuild = (): Build => ({
  name: "Untitled Build",
  invested: emptyStats(),
  race: "none",
  origin: "none",
  oath: "none",
  murmur: "none",
  bell: "none",
  boons: Array(RULES.boonSlots).fill("none"),
  flaws: Array(RULES.flawSlots).fill("none"),
  talents: [],
  mantras: [],
});

export const pointsSpent = (b: Build) => STAT_KEYS.reduce((a, k) => a + b.invested[k], 0);

export const powerFor = (spent: number) =>
  Math.min(RULES.maxPower, Math.floor(spent / RULES.pointsPerPower));

/** Final stats: invested points plus racial bonuses. */
export function totalStats(b: Build): Stats {
  const out = { ...b.invested };
  const bonuses = RACE_BY_ID[b.race]?.bonuses ?? {};
  for (const [k, v] of Object.entries(bonuses)) out[k as keyof Stats] += v ?? 0;
  return out;
}

export function evalContext(b: Build): EvalContext {
  return { stats: totalStats(b), power: powerFor(pointsSpent(b)), pointsPerPower: RULES.pointsPerPower };
}

export interface Availability extends Evaluation {
  /** Reason the item is locked behind a non-stat choice (origin, murmur...). */
  gate?: string;
}

export function talentAvailability(t: Talent, b: Build, ctx = evalContext(b)): Availability {
  const e = evaluate(t.req, ctx);
  if (t.murmur && b.murmur !== t.murmur) return { ...e, met: false, gate: `Requires ${t.murmur} murmur` };
  if (t.origin && b.origin !== t.origin) return { ...e, met: false, gate: `Requires ${t.origin} origin` };
  return e;
}

export function mantraAvailability(m: Mantra, b: Build, ctx = evalContext(b)): Availability {
  const e = evaluate(m.req, ctx);
  if (b.oath === "silentheart") return { ...e, met: false, gate: "Silentheart cannot use mantras" };
  return e;
}

export const evalReq = (req: Req, b: Build) => evaluate(req, evalContext(b));

export function factionCap(b: Build) {
  return b.talents.includes("command-division") ? RULES.factionCapCommand : RULES.factionCap;
}

/**
 * Assigns chosen mantras to slots. Each mantra fills its own category first,
 * overflowing into the wildcard slot. Wisps always use the wildcard slot.
 */
export function mantraSlots(b: Build) {
  const caps = RULES.mantraSlots;
  const used: Record<keyof typeof caps, number> = { combat: 0, mobility: 0, support: 0, wildcard: 0 };
  const overflow: string[] = [];
  for (const id of b.mantras) {
    const m = MANTRA_BY_ID[id];
    if (!m) continue;
    const cat: keyof typeof caps = m.category === "wisp" ? "wildcard" : m.category;
    if (used[cat] < caps[cat]) used[cat]++;
    else if (used.wildcard < caps.wildcard) used.wildcard++;
    else overflow.push(id);
  }
  return { used, caps, overflow };
}

export function canAddMantra(b: Build, cat: MantraCategory) {
  const { used, caps } = mantraSlots(b);
  if (used.wildcard < caps.wildcard) return true;
  return cat !== "wisp" && used[cat] < caps[cat];
}

/** Things worth warning the player about. */
export function buildWarnings(b: Build): string[] {
  const w: string[] = [];
  const ctx = evalContext(b);
  const spent = pointsSpent(b);
  if (spent > RULES.totalPoints) w.push(`Over budget by ${spent - RULES.totalPoints} points.`);
  const oath = OATH_BY_ID[b.oath];
  if (oath && !evaluate(oath.req, ctx).met) w.push(`${oath.name} requirements are no longer met.`);
  for (const id of b.talents) {
    const t = TALENT_BY_ID[id];
    if (t && !talentAvailability(t, b, ctx).met) w.push(`Talent "${t.name}" requirements are not met.`);
  }
  for (const id of b.mantras) {
    const m = MANTRA_BY_ID[id];
    if (m && !mantraAvailability(m, b, ctx).met) w.push(`Mantra "${m.name}" requirements are not met.`);
  }
  const factions = b.talents.filter((id) => TALENT_BY_ID[id]?.rarity === "faction").length;
  if (factions > factionCap(b)) w.push(`Too many faction talents (${factions}/${factionCap(b)}).`);
  if (b.talents.length > RULES.talentCap) w.push(`Talent cap exceeded (${b.talents.length}/${RULES.talentCap}).`);
  return w;
}

export interface Derived {
  power: number;
  health: number;
  posture: number;
  ether: number;
  tempo: number;
  sanity: number;
  carryLoad: number;
}

/**
 * Rough derived stats. These are illustrative estimates, not the game's
 * exact formulas — tweak the coefficients here as better data appears.
 */
export function derived(b: Build): Derived {
  const s = totalStats(b);
  const power = powerFor(pointsSpent(b));
  const attune = s.FIR + s.ICE + s.LTN + s.WND + s.SDW + s.MTL + s.BLD;
  const packmule = b.boons.includes("packmule") ? 1.5 : 1;
  return {
    power,
    health: Math.round(100 + power * 4 + s.FTD * 0.9 + s.STR * 0.2),
    posture: Math.round(50 + s.FTD * 0.25 + s.STR * 0.1 + s.HVY * 0.05),
    ether: Math.round(100 + s.INT * 0.6 + s.WLL * 0.4 + attune * 0.15),
    tempo: Math.round(100 + s.CHA * 0.3 + s.AGL * 0.1),
    sanity: Math.round(100 + s.WLL * 0.6),
    carryLoad: Math.round((100 + s.STR * 1.5 + s.FTD * 0.75) * packmule),
  };
}
