import { STAT_KEYS, emptyStats } from "../data/stats";
import { newBuild, type Build } from "./build";

const VERSION = 1;

interface Packed {
  v: number;
  n: string;
  s: number[];
  r: string;
  o: string;
  oa: string;
  m: string;
  b: string;
  bo: string[];
  f: string[];
  t: string[];
  ma: string[];
}

function toBase64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeBuild(b: Build): string {
  const p: Packed = {
    v: VERSION,
    n: b.name,
    s: STAT_KEYS.map((k) => b.invested[k]),
    r: b.race,
    o: b.origin,
    oa: b.oath,
    m: b.murmur,
    b: b.bell,
    bo: b.boons,
    f: b.flaws,
    t: b.talents,
    ma: b.mantras,
  };
  return toBase64Url(JSON.stringify(p));
}

/** Decodes a share string, falling back to defaults for anything missing. */
export function decodeBuild(code: string): Build | null {
  try {
    const p = JSON.parse(fromBase64Url(code)) as Partial<Packed>;
    if (p.v !== VERSION) return null;
    const base = newBuild();
    const invested = emptyStats();
    STAT_KEYS.forEach((k, i) => (invested[k] = Math.max(0, Math.floor(Number(p.s?.[i]) || 0))));
    const strs = (x: unknown, fallback: string[]) =>
      Array.isArray(x) ? x.filter((v): v is string => typeof v === "string") : fallback;
    return {
      name: typeof p.n === "string" ? p.n : base.name,
      invested,
      race: p.r ?? base.race,
      origin: p.o ?? base.origin,
      oath: p.oa ?? base.oath,
      murmur: p.m ?? base.murmur,
      bell: p.b ?? base.bell,
      boons: strs(p.bo, base.boons),
      flaws: strs(p.f, base.flaws),
      talents: strs(p.t, []),
      mantras: strs(p.ma, []),
    };
  } catch {
    return null;
  }
}
