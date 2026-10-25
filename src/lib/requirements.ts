import { isStatKey, STAT_BY_KEY, type StatKey, type Stats } from "../data/stats";

/**
 * Requirement mini-language used throughout the data files:
 *
 *   STR 25                    single stat
 *   comb(STR,FTD,WLL) 40      combined total of several stats
 *   LVL 15                    power level
 *   A & B                     both
 *   A | B                     either (lower precedence than &)
 *   ( ... )                   grouping
 *
 * An empty string means "no requirement".
 */
export type Req =
  | { kind: "none" }
  | { kind: "stat"; stat: StatKey; min: number }
  | { kind: "comb"; stats: StatKey[]; min: number }
  | { kind: "power"; min: number }
  | { kind: "all"; reqs: Req[] }
  | { kind: "any"; reqs: Req[] };

const TOKEN = /\s*(\(|\)|&|\||,|[A-Za-z]+|\d+)/y;

function tokenize(src: string): string[] {
  const out: string[] = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < src.length) {
    if (/^\s*$/.test(src.slice(TOKEN.lastIndex))) break;
    const m = TOKEN.exec(src);
    if (!m) throw new Error(`Bad requirement near "${src.slice(TOKEN.lastIndex)}" in "${src}"`);
    out.push(m[1]);
  }
  return out;
}

export function parseReq(src: string): Req {
  const tokens = tokenize(src);
  if (tokens.length === 0) return { kind: "none" };
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];
  const expect = (t: string) => {
    if (next() !== t) throw new Error(`Expected "${t}" in "${src}"`);
  };
  const num = () => {
    const t = next();
    if (!/^\d+$/.test(t ?? "")) throw new Error(`Expected number in "${src}"`);
    return Number(t);
  };
  const stat = (): StatKey => {
    const t = next()?.toUpperCase() ?? "";
    if (!isStatKey(t)) throw new Error(`Unknown stat "${t}" in "${src}"`);
    return t;
  };

  function atom(): Req {
    const t = peek();
    if (t === "(") {
      next();
      const r = orExpr();
      expect(")");
      return r;
    }
    if (t?.toLowerCase() === "comb") {
      next();
      expect("(");
      const stats = [stat()];
      while (peek() === ",") {
        next();
        stats.push(stat());
      }
      expect(")");
      return { kind: "comb", stats, min: num() };
    }
    if (t?.toUpperCase() === "LVL") {
      next();
      return { kind: "power", min: num() };
    }
    const s = stat();
    return { kind: "stat", stat: s, min: num() };
  }

  function andExpr(): Req {
    const reqs = [atom()];
    while (peek() === "&") {
      next();
      reqs.push(atom());
    }
    return reqs.length === 1 ? reqs[0] : { kind: "all", reqs };
  }

  function orExpr(): Req {
    const reqs = [andExpr()];
    while (peek() === "|") {
      next();
      reqs.push(andExpr());
    }
    return reqs.length === 1 ? reqs[0] : { kind: "any", reqs };
  }

  const r = orExpr();
  if (i !== tokens.length) throw new Error(`Unexpected "${peek()}" in "${src}"`);
  return r;
}

export interface Evaluation {
  met: boolean;
  /** Rough number of investment points still needed (cheapest branch for ORs). */
  cost: number;
  /** Human readable shortfalls for the cheapest path, e.g. "STR +5". */
  missing: string[];
}

export interface EvalContext {
  stats: Stats;
  power: number;
  pointsPerPower: number;
}

export function evaluate(req: Req, ctx: EvalContext): Evaluation {
  switch (req.kind) {
    case "none":
      return { met: true, cost: 0, missing: [] };
    case "stat": {
      const d = req.min - ctx.stats[req.stat];
      return d <= 0
        ? { met: true, cost: 0, missing: [] }
        : { met: false, cost: d, missing: [`${req.stat} +${d}`] };
    }
    case "comb": {
      const total = req.stats.reduce((a, s) => a + ctx.stats[s], 0);
      const d = req.min - total;
      return d <= 0
        ? { met: true, cost: 0, missing: [] }
        : { met: false, cost: d, missing: [`${req.stats.join("/")} +${d}`] };
    }
    case "power": {
      const d = req.min - ctx.power;
      return d <= 0
        ? { met: true, cost: 0, missing: [] }
        : { met: false, cost: d * ctx.pointsPerPower, missing: [`Power ${req.min}`] };
    }
    case "all": {
      const parts = req.reqs.map((r) => evaluate(r, ctx));
      return {
        met: parts.every((p) => p.met),
        cost: parts.reduce((a, p) => a + p.cost, 0),
        missing: parts.flatMap((p) => p.missing),
      };
    }
    case "any": {
      const parts = req.reqs.map((r) => evaluate(r, ctx));
      const met = parts.find((p) => p.met);
      if (met) return met;
      return parts.reduce((best, p) => (p.cost < best.cost ? p : best));
    }
  }
}

/** Pretty-prints a requirement for display. */
export function formatReq(req: Req, nested = false): string {
  switch (req.kind) {
    case "none":
      return "No requirement";
    case "stat":
      return `${req.min} ${STAT_BY_KEY[req.stat].name}`;
    case "comb":
      return `${req.min} combined ${req.stats.join(" / ")}`;
    case "power":
      return `Power ${req.min}`;
    case "all": {
      const s = req.reqs.map((r) => formatReq(r, true)).join(" + ");
      return nested ? `(${s})` : s;
    }
    case "any": {
      const s = req.reqs.map((r) => formatReq(r, true)).join(" or ");
      return nested ? `(${s})` : s;
    }
  }
}

/** Every stat a requirement touches — used to highlight relevant stats. */
export function reqStats(req: Req): StatKey[] {
  switch (req.kind) {
    case "stat":
      return [req.stat];
    case "comb":
      return req.stats;
    case "all":
    case "any":
      return [...new Set(req.reqs.flatMap(reqStats))];
    default:
      return [];
  }
}
