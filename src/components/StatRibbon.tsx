import type { CSSProperties } from "react";
import { STATS } from "../data/stats";
import { totalStats, type Build } from "../lib/build";

/** Compact read-out of every stat; requirement hovers light up the relevant ones. */
export function StatRibbon({ build, highlight }: { build: Build; highlight: Set<string> }) {
  const totals = totalStats(build);
  return (
    <section className="panel ribbon" aria-label="Current stats">
      {STATS.map((s) => (
        <span
          key={s.key}
          className={`ribbon-cell ${totals[s.key] > 0 ? "active" : ""} ${highlight.has(s.key) ? "hl" : ""}`}
          style={{ "--c": s.color } as CSSProperties}
          title={s.name}
        >
          <span className="ribbon-key">{s.key}</span>
          <span className="ribbon-val">{totals[s.key]}</span>
        </span>
      ))}
    </section>
  );
}
