import racesJson from "../data/races.json";
import oathsJson from "../data/oaths.json";
import originsJson from "../data/origins.json";
import murmursJson from "../data/murmurs.json";
import bellsJson from "../data/bells.json";
import boonsJson from "../data/boons.json";
import flawsJson from "../data/flaws.json";
import talentsJson from "../data/talents.json";
import mantrasJson from "../data/mantras.json";
import { isStatKey, type StatKey } from "../data/stats";
import { parseReq, type Req } from "./requirements";

/** Tunable game rules. Everything here is best-effort and easy to adjust. */
export const RULES = {
  totalPoints: 330,
  pointsPerPower: 15,
  maxPower: 20,
  statCap: 100,
  talentCap: 76,
  factionCap: 4,
  factionCapCommand: 5,
  boonSlots: 2,
  flawSlots: 2,
  mantraSlots: { combat: 3, mobility: 1, support: 1, wildcard: 1 },
} as const;

export interface Choice {
  id: string;
  name: string;
  blurb?: string;
}

export interface Race extends Choice {
  bonuses: Partial<Record<StatKey, number>>;
}

export interface Oath extends Choice {
  reqSrc: string;
  req: Req;
}

export type TalentRarity = "common" | "rare" | "quest" | "murmur" | "origin" | "faction";

export interface Talent {
  id: string;
  name: string;
  rarity: TalentRarity;
  category: string;
  reqSrc: string;
  req: Req;
  desc: string;
  murmur?: string;
  origin?: string;
}

export type MantraCategory = "combat" | "mobility" | "support" | "wisp";

export interface Mantra {
  id: string;
  name: string;
  category: MantraCategory;
  attunement?: StatKey;
  reqSrc: string;
  req: Req;
  desc: string;
}

function withReq<T extends { req: string }>(item: T): Omit<T, "req"> & { reqSrc: string; req: Req } {
  return { ...item, reqSrc: item.req, req: parseReq(item.req) };
}

export const RACES: Race[] = racesJson.map((r) => {
  for (const k of Object.keys(r.bonuses)) {
    if (!isStatKey(k)) throw new Error(`Race ${r.id}: unknown stat ${k}`);
  }
  return r as Race;
});
export const OATHS: Oath[] = oathsJson.map(withReq);
export const ORIGINS: Choice[] = originsJson;
export const MURMURS: Choice[] = murmursJson;
export const BELLS: Choice[] = bellsJson;
export const BOONS: Choice[] = boonsJson;
export const FLAWS: Choice[] = flawsJson;
export const TALENTS: Talent[] = talentsJson.map((t) => withReq(t as typeof t & { rarity: TalentRarity }));
export const MANTRAS: Mantra[] = mantrasJson.map((m) => {
  if (m.attunement && !isStatKey(m.attunement)) {
    throw new Error(`Mantra ${m.id}: unknown attunement ${m.attunement}`);
  }
  return withReq(m as typeof m & { category: MantraCategory; attunement?: StatKey });
});

const index = <T extends { id: string }>(xs: T[]) =>
  Object.fromEntries(xs.map((x) => [x.id, x])) as Record<string, T>;

export const RACE_BY_ID = index(RACES);
export const OATH_BY_ID = index(OATHS);
export const ORIGIN_BY_ID = index(ORIGINS);
export const MURMUR_BY_ID = index(MURMURS);
export const BELL_BY_ID = index(BELLS);
export const BOON_BY_ID = index(BOONS);
export const FLAW_BY_ID = index(FLAWS);
export const TALENT_BY_ID = index(TALENTS);
export const MANTRA_BY_ID = index(MANTRAS);
