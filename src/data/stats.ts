export type StatGroup = "attribute" | "weapon" | "attunement";

export interface StatDef {
  key: StatKey;
  name: string;
  group: StatGroup;
  /** Flat accent color used for bars and swatches. */
  color: string;
}

export const STAT_KEYS = [
  "STR", "FTD", "AGL", "INT", "WLL", "CHA",
  "HVY", "MED", "LHT",
  "FIR", "ICE", "LTN", "WND", "SDW", "MTL", "BLD",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;

export const STATS: StatDef[] = [
  { key: "STR", name: "Strength", group: "attribute", color: "#c4574b" },
  { key: "FTD", name: "Fortitude", group: "attribute", color: "#c08a4a" },
  { key: "AGL", name: "Agility", group: "attribute", color: "#7fa86a" },
  { key: "INT", name: "Intelligence", group: "attribute", color: "#5f8fb8" },
  { key: "WLL", name: "Willpower", group: "attribute", color: "#8f78b0" },
  { key: "CHA", name: "Charisma", group: "attribute", color: "#b8708f" },

  { key: "HVY", name: "Heavy Wep.", group: "weapon", color: "#a56b4f" },
  { key: "MED", name: "Medium Wep.", group: "weapon", color: "#9a9a8c" },
  { key: "LHT", name: "Light Wep.", group: "weapon", color: "#7fa39b" },

  { key: "FIR", name: "Flamecharm", group: "attunement", color: "#d06a37" },
  { key: "ICE", name: "Frostdraw", group: "attunement", color: "#6fb3c8" },
  { key: "LTN", name: "Thundercall", group: "attunement", color: "#d3b54a" },
  { key: "WND", name: "Galebreathe", group: "attunement", color: "#93b59a" },
  { key: "SDW", name: "Shadowcast", group: "attunement", color: "#7a64a8" },
  { key: "MTL", name: "Ironsing", group: "attunement", color: "#8c939b" },
  { key: "BLD", name: "Bloodrend", group: "attunement", color: "#a8343f" },
];

export const STAT_BY_KEY: Record<StatKey, StatDef> = Object.fromEntries(
  STATS.map((s) => [s.key, s]),
) as Record<StatKey, StatDef>;

export const isStatKey = (s: string): s is StatKey =>
  (STAT_KEYS as readonly string[]).includes(s);

export const emptyStats = (): Stats =>
  Object.fromEntries(STAT_KEYS.map((k) => [k, 0])) as Stats;
