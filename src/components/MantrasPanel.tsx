import { useState, type CSSProperties, type Dispatch } from "react";
import { STAT_BY_KEY } from "../data/stats";
import { canAddMantra, evalContext, mantraAvailability, mantraSlots, type Build } from "../lib/build";
import { MANTRAS, type MantraCategory } from "../lib/game";
import { formatReq, reqStats } from "../lib/requirements";
import type { Action } from "../lib/useBuild";
import { StatIcon } from "./StatIcon";

const CATEGORIES: { id: MantraCategory; title: string }[] = [
  { id: "combat", title: "Combat" },
  { id: "mobility", title: "Mobility" },
  { id: "support", title: "Support" },
  { id: "wisp", title: "Wisp" },
];

interface Props {
  build: Build;
  dispatch: Dispatch<Action>;
  onHover: (stats: string[]) => void;
}

export function MantrasPanel({ build, dispatch, onHover }: Props) {
  const [query, setQuery] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const ctx = evalContext(build);
  const { used, caps } = mantraSlots(build);
  const selected = new Set(build.mantras);

  const q = query.trim().toLowerCase();
  const rows = MANTRAS.map((m) => ({ m, a: mantraAvailability(m, build, ctx) })).filter(
    ({ m, a }) =>
      (!q || `${m.name} ${m.desc}`.toLowerCase().includes(q)) && (!onlyAvailable || a.met || selected.has(m.id)),
  );

  return (
    <section className="panel cards-panel">
      <div className="cards-head">
        <h2 className="section-title">Mantras</h2>
        <div className="slots">
          {(Object.keys(caps) as (keyof typeof caps)[]).map((k) => (
            <div key={k} className="slot-group">
              <span className="slot-label">{k}</span>
              <span className="slot-pips">
                {Array.from({ length: caps[k] }, (_, i) => (
                  <span key={i} className={`slot-pip ${i < used[k] ? "filled" : ""}`} />
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="filters">
        <input className="search" placeholder="Search mantras…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="toggle">
          <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          Only show learnable
        </label>
      </div>

      {build.oath === "silentheart" && <p className="warn-banner">Silentheart forsakes mantras.</p>}

      {CATEGORIES.map((c) => {
        const items = rows.filter((r) => r.m.category === c.id);
        if (!items.length) return null;
        return (
          <div key={c.id} className="card-group">
            <h3 className="group-title">{c.title}</h3>
            <div className="card-grid">
              {items.map(({ m, a }) => {
                const isSel = selected.has(m.id);
                const blocked = !isSel && (!a.met || !canAddMantra(build, m.category));
                const state = isSel ? (a.met ? "selected" : "broken") : a.met ? "available" : "locked";
                const color = m.attunement ? STAT_BY_KEY[m.attunement].color : "var(--abyssal)";
                return (
                  <button
                    key={m.id}
                    className={`card mantra ${state}`}
                    style={{ "--c": color } as CSSProperties}
                    onClick={() => !blocked && dispatch({ type: "toggleMantra", id: m.id })}
                    aria-pressed={isSel}
                    aria-disabled={blocked}
                    onMouseEnter={() => onHover(reqStats(m.req))}
                    onMouseLeave={() => onHover([])}
                  >
                    <span className="card-top">
                      <span className="card-name">{m.name}</span>
                      <span className="card-rarity">
                        {m.attunement ? (
                          <>
                            <StatIcon stat={m.attunement} className="stat-icon small" />
                            {STAT_BY_KEY[m.attunement].name}
                          </>
                        ) : (
                          <>
                            <span className="swatch small" aria-hidden />
                            Abyssal
                          </>
                        )}
                      </span>
                    </span>
                    <span className="card-desc">{m.desc}</span>
                    <span className="card-req">{m.reqSrc ? formatReq(m.req) : "No requirement"}</span>
                    {!a.met && <span className="card-missing">{a.gate ?? `Need ${a.missing.join(", ")}`}</span>}
                    {a.met && !isSel && blocked && <span className="card-missing">No free slot</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
