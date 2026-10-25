import type { CSSProperties } from "react";
import { STATS } from "../data/stats";
import { buildWarnings, derived, totalStats, type Build } from "../lib/build";
import {
  BELL_BY_ID,
  BOON_BY_ID,
  FLAW_BY_ID,
  MANTRA_BY_ID,
  MURMUR_BY_ID,
  OATH_BY_ID,
  ORIGIN_BY_ID,
  RACE_BY_ID,
  TALENT_BY_ID,
} from "../lib/game";

const named = (id: string, table: Record<string, { name: string }>) => (id === "none" ? "—" : table[id]?.name ?? id);

const namedList = (ids: string[], table: Record<string, { name: string }>) =>
  ids.filter((id) => id !== "none").map((id) => named(id, table)).join(", ") || "—";

export function SummaryPanel({ build }: { build: Build }) {
  const d = derived(build);
  const totals = totalStats(build);
  const warnings = buildWarnings(build);
  const invested = STATS.filter((s) => totals[s.key] > 0);

  const tiles: { label: string; value: number; color: string }[] = [
    { label: "Health", value: d.health, color: "#c4574b" },
    { label: "Posture", value: d.posture, color: "#c08a4a" },
    { label: "Ether", value: d.ether, color: "#6fb3c8" },
    { label: "Tempo", value: d.tempo, color: "#b8708f" },
    { label: "Sanity", value: d.sanity, color: "#8f78b0" },
    { label: "Carry Load", value: d.carryLoad, color: "#7fa86a" },
  ];

  return (
    <div className="summary">
      <section className="panel">
        <h2 className="section-title">At a Glance</h2>
        <div className="tiles">
          {tiles.map((t) => (
            <div key={t.label} className="tile" style={{ "--c": t.color } as CSSProperties}>
              <span className="tile-label">{t.label}</span>
              <span className="tile-value">≈{t.value}</span>
            </div>
          ))}
        </div>
        <p className="hint">Derived values are rough estimates for comparing builds, not exact in-game numbers.</p>
      </section>

      <section className="panel">
        <h2 className="section-title">Identity</h2>
        <dl className="identity">
          <dt>Race</dt><dd>{named(build.race, RACE_BY_ID)}</dd>
          <dt>Origin</dt><dd>{named(build.origin, ORIGIN_BY_ID)}</dd>
          <dt>Oath</dt><dd>{named(build.oath, OATH_BY_ID)}</dd>
          <dt>Murmur</dt><dd>{named(build.murmur, MURMUR_BY_ID)}</dd>
          <dt>Bell</dt><dd>{named(build.bell, BELL_BY_ID)}</dd>
          <dt>Boons</dt><dd>{namedList(build.boons, BOON_BY_ID)}</dd>
          <dt>Flaws</dt><dd>{namedList(build.flaws, FLAW_BY_ID)}</dd>
        </dl>
      </section>

      <section className="panel">
        <h2 className="section-title">Stat Spread</h2>
        {invested.length === 0 ? (
          <p className="empty">No points invested yet.</p>
        ) : (
          <div className="spread">
            {invested.map((s) => (
              <div key={s.key} className="spread-row" style={{ "--c": s.color } as CSSProperties}>
                <span className="spread-key">{s.key}</span>
                <span className="spread-bar"><span style={{ width: `${Math.min(100, totals[s.key])}%` }} /></span>
                <span className="spread-val">{totals[s.key]}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">Kit</h2>
        <h3 className="group-title">Talents ({build.talents.length})</h3>
        <div className="tag-list">
          {build.talents.length ? build.talents.map((id) => <span key={id} className="tag">{TALENT_BY_ID[id]?.name ?? id}</span>) : <span className="empty">None</span>}
        </div>
        <h3 className="group-title">Mantras ({build.mantras.length})</h3>
        <div className="tag-list">
          {build.mantras.length ? build.mantras.map((id) => <span key={id} className="tag">{MANTRA_BY_ID[id]?.name ?? id}</span>) : <span className="empty">None</span>}
        </div>
      </section>

      <section className={`panel ${warnings.length ? "warnings" : "all-good"}`}>
        <h2 className="section-title">Validation</h2>
        {warnings.length === 0 ? (
          <p>✓ Build is valid — every requirement is satisfied.</p>
        ) : (
          <ul>{warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        )}
      </section>
    </div>
  );
}
