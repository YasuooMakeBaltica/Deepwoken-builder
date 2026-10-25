import { useState, type Dispatch } from "react";
import type { Build } from "../lib/build";
import { pointsSpent, powerFor } from "../lib/build";
import { RULES } from "../lib/game";
import { encodeBuild } from "../lib/share";
import type { Action } from "../lib/useBuild";

interface Props {
  build: Build;
  dispatch: Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
}

export function Header({ build, dispatch, canUndo, canRedo }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${location.origin}${location.pathname}#b=${encodeBuild(build)}`;
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy your build link:", url);
    }
  };

  // No confirmation step: starting over is a single undoable action.
  const reset = () => {
    history.replaceState(null, "", location.pathname);
    dispatch({ type: "reset" });
  };

  return (
    <header className="header panel">
      <div className="brand">
        <span className="brand-mark" aria-hidden />
        <div>
          <div className="brand-title">Abyssal Builder</div>
          <div className="brand-sub">a Deepwoken build planner</div>
        </div>
      </div>
      <input
        className="build-name"
        value={build.name}
        onChange={(e) => dispatch({ type: "set", patch: { name: e.target.value } })}
        aria-label="Build name"
        maxLength={60}
      />
      <div className="header-actions">
        <button className="btn ghost" onClick={() => dispatch({ type: "undo" })} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="btn ghost" onClick={() => dispatch({ type: "redo" })} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
        <button className="btn ghost" onClick={reset} title="Start over (undoable)">New build</button>
        <button className="btn primary" onClick={share}>{copied ? "Link copied" : "Copy share link"}</button>
      </div>
    </header>
  );
}

export function DepthGauge({ build }: { build: Build }) {
  const spent = pointsSpent(build);
  const power = powerFor(spent);
  const left = RULES.totalPoints - spent;
  const toNext = power >= RULES.maxPower ? 0 : (power + 1) * RULES.pointsPerPower - spent;
  const pct = (spent / RULES.totalPoints) * 100;

  return (
    <section className="gauge panel" aria-label="Investment">
      <div className="gauge-power">
        <span className="gauge-label">Power</span>
        <span className="gauge-value" key={power}>{power}</span>
      </div>
      <div className="gauge-track-wrap">
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${pct}%` }} />
          {Array.from({ length: RULES.maxPower }, (_, i) => (
            <span
              key={i}
              className={`gauge-tick ${i < power ? "lit" : ""}`}
              style={{ left: `${(((i + 1) * RULES.pointsPerPower) / RULES.totalPoints) * 100}%` }}
            />
          ))}
        </div>
        <div className="gauge-meta">
          <span><b>{spent}</b> / {RULES.totalPoints} invested</span>
          <span>{toNext > 0 ? <>next power in <b>{toNext}</b></> : "max power reached"}</span>
          <span className={left === 0 ? "ok" : ""}><b>{left}</b> points left</span>
        </div>
      </div>
    </section>
  );
}
