export type StatGroup = "attribute" | "weapon" | "attunement";

export interface StatDef {
  key: StatKey;
  name: string;
  group: StatGroup;
  /** Accent color used for glows, bars and badges. */
  color: string;
  glyph: string;
}

export const STAT_KEYS = [
  "STR", "FTD", "AGL", "INT", "WLL", "CHA",
  "HVY", "MED", "LHT",
  "FIR", "ICE", "LTN", "WND", "SDW", "MTL", "BLD",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];
export type Stats = Record<StatKey, number>;

export const STATS: StatDef[] = [
  { key: "STR", name: "Strength", group: "attribute", color: "#e0605a", glyph: "✊" },
  { key: "FTD", name: "Fortitude", group: "attribute", color: "#d9a35b", glyph: "⛨" },
  { key: "AGL", name: "Agility", group: "attribute", color: "#6fd39b", glyph: "➶" },
  { key: "INT", name: "Intelligence", group: "attribute", color: "#6fa8ff", glyph: "◈" },
  { key: "WLL", name: "Willpower", group: "attribute", color: "#b48cff", glyph: "✧" },
  { key: "CHA", name: "Charisma", group: "attribute", color: "#ff8fcf", glyph: "❦" },

  { key: "HVY", name: "Heavy Wep.", group: "weapon", color: "#c9785a", glyph: "⚒" },
  { key: "MED", name: "Medium Wep.", group: "weapon", color: "#c0c7d6", glyph: "⚔" },
  { key: "LHT", name: "Light Wep.", group: "weapon", color: "#9fe0d6", glyph: "🗡" },

  { key: "FIR", name: "Flamecharm", group: "attunement", color: "#ff7a3d", glyph: "🔥" },
  { key: "ICE", name: "Frostdraw", group: "attunement", color: "#7fe3ff", glyph: "❄" },
  { key: "LTN", name: "Thundercall", group: "attunement", color: "#ffe25c", glyph: "ϟ" },
  { key: "WND", name: "Galebreathe", group: "attunement", color: "#b8f5c8", glyph: "≋" },
  { key: "SDW", name: "Shadowcast", group: "attunement", color: "#9a6bff", glyph: "◐" },
  { key: "MTL", name: "Ironsing", group: "attunement", color: "#a9b4c2", glyph: "⛓" },
  { key: "BLD", name: "Bloodrend", group: "attunement", color: "#ff3b5c", glyph: "🩸" },
];

export const STAT_BY_KEY: Record<StatKey, StatDef> = Object.fromEntries(
  STATS.map((s) => [s.key, s]),
) as Record<StatKey, StatDef>;

export const isStatKey = (s: string): s is StatKey =>
  (STAT_KEYS as readonly string[]).includes(s);

export const emptyStats = (): Stats =>
  Object.fromEntries(STAT_KEYS.map((k) => [k, 0])) as Stats;
