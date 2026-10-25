import { useState, type Dispatch } from "react";
import { evalContext, factionCap, talentAvailability, type Build } from "../lib/build";
import { RULES, TALENTS, type TalentRarity } from "../lib/game";
import { formatReq, reqStats } from "../lib/requirements";
import type { Action } from "../lib/useBuild";

const RARITIES: (TalentRarity | "all")[] = ["all", "common", "rare", "quest", "murmur", "origin", "faction"];
const VIEWS = ["all", "available", "selected", "locked"] as const;
type View = (typeof VIEWS)[number];

interface Props {
  build: Build;
  dispatch: Dispatch<Action>;
  onHover: (stats: string[]) => void;
}

export function TalentsPanel({ build, dispatch, onHover }: Props) {
  const [query, setQuery] = useState("");
  const [rarity, setRarity] = useState<TalentRarity | "all">("all");
  const [view, setView] = useState<View>("all");

  const ctx = evalContext(build);
  const selected = new Set(build.talents);
  const factionCount = build.talents.filter((id) => TALENTS.find((t) => t.id === id)?.rarity === "faction").length;
  const fCap = factionCap(build);
  const atCap = build.talents.length >= RULES.talentCap;

  const q = query.trim().toLowerCase();
  const all = TALENTS.map((t) => ({ t, a: talentAvailability(t, build, ctx) }));
  const rows = all.filter(({ t, a }) => {
    if (rarity !== "all" && t.rarity !== rarity) return false;
    if (q && !`${t.name} ${t.desc} ${t.category}`.toLowerCase().includes(q)) return false;
    if (view === "available") return a.met && !selected.has(t.id);
    if (view === "selected") return selected.has(t.id);
    if (view === "locked") return !a.met;
    return true;
  });

  const byCategory = new Map<string, typeof rows>();
  for (const r of rows) byCategory.set(r.t.category, [...(byCategory.get(r.t.category) ?? []), r]);
  const groups = [...byCategory];

  const nearest = all
    .filter(({ t, a }) => !a.met && !a.gate && !selected.has(t.id))
    .sort((x, y) => x.a.cost - y.a.cost)
    .slice(0, 4);

  return (
    <section className="panel cards-panel">
      <div className="cards-head">
        <h2 className="section-title">Talents</h2>
        <div className="counters">
          <span className="counter"><b>{build.talents.length}</b>/{RULES.talentCap} talents</span>
          <span className={`counter ${factionCount > fCap ? "bad" : ""}`}><b>{factionCount}</b>/{fCap} faction</span>
        </div>
      </div>

      {nearest.length > 0 && (
        <div className="nearest">
          <span className="nearest-label">Within reach:</span>
          {nearest.map(({ t, a }) => (
            <span key={t.id} className="nearest-item" onMouseEnter={() => onHover(reqStats(t.req))} onMouseLeave={() => onHover([])}>
              {t.name} <em>{a.missing.join(", ")}</em>
            </span>
          ))}
        </div>
      )}

      <div className="filters">
        <input className="search" placeholder="Search talents…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          {RARITIES.map((r) => (
            <button key={r} className={`chip-btn rarity-${r} ${rarity === r ? "on" : ""}`} onClick={() => setRarity(r)}>
              {r === "all" ? "any rarity" : r}
            </button>
          ))}
        </div>
        <div className="chips">
          {VIEWS.map((v) => (
            <button key={v} className={`chip-btn ${view === v ? "on" : ""}`} onClick={() => setView(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="empty">Nothing matches — the abyss is quiet.</p>}

      {groups.map(([cat, items]) => (
        <div key={cat} className="card-group">
          <h3 className="group-title">{cat}</h3>
          <div className="card-grid">
            {items.map(({ t, a }) => {
              const isSel = selected.has(t.id);
              const blocked = !isSel && (!a.met || atCap || (t.rarity === "faction" && factionCount >= fCap));
              const state = isSel ? (a.met ? "selected" : "broken") : a.met ? "available" : "locked";
              return (
                <button
                  key={t.id}
                  className={`card ${state} rarity-${t.rarity}`}
                  onClick={() => !blocked && dispatch({ type: "toggleTalent", id: t.id })}
                  aria-pressed={isSel}
                  aria-disabled={blocked}
                  onMouseEnter={() => onHover(reqStats(t.req))}
                  onMouseLeave={() => onHover([])}
                  title={t.desc}
                >
                  <span className="card-top">
                    <span className="card-name">{t.name}</span>
                    <span className="card-rarity">{t.rarity}</span>
                  </span>
                  <span className="card-desc">{t.desc}</span>
                  <span className="card-req">
                    {t.reqSrc ? formatReq(t.req) : "No requirement"}
                  </span>
                  {!a.met && (
                    <span className="card-missing">
                      {a.gate ?? `Need ${a.missing.join(", ")}`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
