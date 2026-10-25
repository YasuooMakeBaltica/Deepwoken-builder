import { useState } from "react";
import { AbyssBackground } from "./components/AbyssBackground";
import { CharacterPanel } from "./components/CharacterPanel";
import { DepthGauge, Header } from "./components/Header";
import { MantrasPanel } from "./components/MantrasPanel";
import { StatRibbon } from "./components/StatRibbon";
import { StatsPanel } from "./components/StatsPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { TalentsPanel } from "./components/TalentsPanel";
import { buildWarnings, pointsSpent, powerFor } from "./lib/build";
import { RULES } from "./lib/game";
import { useBuild } from "./lib/useBuild";

const TABS = ["Stats", "Talents", "Mantras", "Summary"] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const { build, dispatch, canUndo, canRedo } = useBuild();
  const [tab, setTab] = useState<Tab>("Stats");
  const [highlight, setHighlight] = useState<Set<string>>(new Set());
  const onHover = (stats: string[]) => setHighlight(new Set(stats));

  const depth = powerFor(pointsSpent(build)) / RULES.maxPower;
  const warnings = buildWarnings(build).length;
  const counts: Partial<Record<Tab, number>> = { Talents: build.talents.length, Mantras: build.mantras.length };

  return (
    <>
      <AbyssBackground depth={depth} />
      <div className="app">
        <Header build={build} dispatch={dispatch} canUndo={canUndo} canRedo={canRedo} />
        <DepthGauge build={build} />

        <div className="layout">
          <aside className="sidebar">
            <StatRibbon build={build} highlight={highlight} />
            <CharacterPanel build={build} dispatch={dispatch} onHover={onHover} />
          </aside>

          <main className="main">
            <nav className="tabs" role="tablist">
              {TABS.map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
                  {t}
                  {counts[t] ? <span className="tab-count">{counts[t]}</span> : null}
                  {t === "Summary" && warnings > 0 && <span className="tab-count bad">{warnings}</span>}
                </button>
              ))}
            </nav>

            <div className="tab-body" key={tab}>
              {tab === "Stats" && <StatsPanel build={build} dispatch={dispatch} highlight={highlight} />}
              {tab === "Talents" && <TalentsPanel build={build} dispatch={dispatch} onHover={onHover} />}
              {tab === "Mantras" && <MantrasPanel build={build} dispatch={dispatch} onHover={onHover} />}
              {tab === "Summary" && <SummaryPanel build={build} />}
            </div>
          </main>
        </div>

        <footer className="footer">
          Fan-made planner. Not affiliated with or endorsed by Deepwoken or its developers. Game data is a best-effort
          approximation — edit <code>src/data/*.json</code> to correct it.
        </footer>
      </div>
    </>
  );
}
