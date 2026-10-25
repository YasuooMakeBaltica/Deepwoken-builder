import type { CSSProperties, Dispatch, MouseEvent } from "react";
import { STATS, type StatDef, type StatGroup } from "../data/stats";
import { pointsSpent, totalStats, type Build } from "../lib/build";
import { RACE_BY_ID, RULES } from "../lib/game";
import type { Action } from "../lib/useBuild";

const GROUPS: { id: StatGroup; title: string }[] = [
  { id: "attribute", title: "Attributes" },
  { id: "weapon", title: "Weapons" },
  { id: "attunement", title: "Attunements" },
];

/** Shift = 5, Ctrl/Cmd = 10, otherwise 1. */
const step = (e: MouseEvent) => (e.ctrlKey || e.metaKey ? 10 : e.shiftKey ? 5 : 1);

interface Props {
  build: Build;
  dispatch: Dispatch<Action>;
  highlight: Set<string>;
}

export function StatsPanel({ build, dispatch, highlight }: Props) {
  const totals = totalStats(build);
  const left = RULES.totalPoints - pointsSpent(build);
  const race = RACE_BY_ID[build.race];

  const row = (s: StatDef) => {
    const invested = build.invested[s.key];
    const bonus = race?.bonuses[s.key] ?? 0;
    const set = (value: number) => dispatch({ type: "setStat", stat: s.key, value });
    return (
      <div
        key={s.key}
        className={`stat-row ${invested > 0 ? "active" : ""} ${highlight.has(s.key) ? "hl" : ""}`}
        style={{ "--c": s.color } as CSSProperties}
      >
        <span className="swatch" aria-hidden />
        <span className="stat-name">
          {s.name}
          <span className="stat-key">{s.key}</span>
        </span>
        <div className="stat-bar">
          <span className="stat-fill" style={{ width: `${(invested / RULES.statCap) * 100}%` }} />
          <input
            type="range"
            min={0}
            max={RULES.statCap}
            value={invested}
            onChange={(e) => set(Number(e.target.value))}
            aria-label={`${s.name} invested`}
          />
        </div>
        <div className="stat-controls">
          <button className="pip" onClick={(e) => set(invested - step(e))} disabled={invested === 0} aria-label={`Decrease ${s.name}`}>−</button>
          <input
            className="stat-input"
            type="number"
            min={0}
            max={RULES.statCap}
            value={invested}
            onChange={(e) => set(Number(e.target.value))}
            aria-label={`${s.name} value`}
          />
          <button
            className="pip"
            onClick={(e) => set(invested + step(e))}
            disabled={invested >= RULES.statCap || left === 0}
            aria-label={`Increase ${s.name}`}
          >
            +
          </button>
        </div>
        <span className="stat-total" title={bonus ? `${invested} invested + ${bonus} racial` : undefined}>
          {totals[s.key]}
          {bonus > 0 && <span className="stat-bonus">+{bonus}</span>}
        </span>
      </div>
    );
  };

  return (
    <div className="stats-grid">
      {GROUPS.map((g) => (
        <section key={g.id} className={`panel stat-group group-${g.id}`}>
          <h2 className="section-title">{g.title}</h2>
          {STATS.filter((s) => s.group === g.id).map(row)}
        </section>
      ))}
      <p className="hint">Tip: Shift-click for ±5, Ctrl-click for ±10.</p>
    </div>
  );
}
