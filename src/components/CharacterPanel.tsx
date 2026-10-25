import type { Dispatch } from "react";
import { STAT_BY_KEY } from "../data/stats";
import { evalReq, type Build } from "../lib/build";
import {
  BELLS,
  BOONS,
  FLAWS,
  MURMURS,
  OATHS,
  OATH_BY_ID,
  ORIGINS,
  ORIGIN_BY_ID,
  RACES,
  RACE_BY_ID,
  type Choice,
} from "../lib/game";
import { formatReq, reqStats } from "../lib/requirements";
import type { Action } from "../lib/useBuild";

interface Props {
  build: Build;
  dispatch: Dispatch<Action>;
  onHover: (stats: string[]) => void;
}

function Select({
  label,
  value,
  options,
  onChange,
  render,
}: {
  label: string;
  value: string;
  options: Choice[];
  onChange: (id: string) => void;
  render?: (c: Choice) => string;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {render ? render(o) : o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CharacterPanel({ build, dispatch, onHover }: Props) {
  const set = (patch: Partial<Build>) => dispatch({ type: "set", patch });
  const race = RACE_BY_ID[build.race];
  const oath = OATH_BY_ID[build.oath];
  const oathEval = oath ? evalReq(oath.req, build) : null;

  const raceLabel = (c: Choice) => {
    const bonuses = Object.entries(RACE_BY_ID[c.id]?.bonuses ?? {})
      .map(([k, v]) => `+${v} ${k}`)
      .join(" ");
    return bonuses ? `${c.name}  (${bonuses})` : c.name;
  };

  const slotList = (key: "boons" | "flaws", options: Choice[], label: string) =>
    build[key].map((v, i) => (
      <Select
        key={`${key}-${i}`}
        label={`${label} ${i + 1}`}
        value={v}
        options={options.filter((o) => o.id === "none" || o.id === v || !build[key].includes(o.id))}
        onChange={(id) => set({ [key]: build[key].map((x, j) => (j === i ? id : x)) })}
      />
    ));

  return (
    <section className="panel character">
      <h2 className="section-title">Character</h2>

      <Select label="Race" value={build.race} options={RACES} onChange={(race) => set({ race })} render={raceLabel} />
      {race && race.id !== "none" && (
        <p className="field-blurb">
          {race.blurb}{" "}
          {Object.entries(race.bonuses).map(([k, v]) => (
            <span key={k} className="chip" style={{ color: STAT_BY_KEY[k as keyof typeof STAT_BY_KEY].color }}>
              +{v} {k}
            </span>
          ))}
        </p>
      )}

      <Select label="Origin" value={build.origin} options={ORIGINS} onChange={(origin) => set({ origin })} />
      {build.origin !== "none" && <p className="field-blurb">{ORIGIN_BY_ID[build.origin]?.blurb}</p>}

      <div onMouseEnter={() => oath && onHover(reqStats(oath.req))} onMouseLeave={() => onHover([])}>
        <Select
          label="Oath"
          value={build.oath}
          options={OATHS}
          onChange={(o) => set({ oath: o })}
          render={(c) => {
            const o = OATH_BY_ID[c.id];
            const ok = o && evalReq(o.req, build).met;
            return `${ok ? "✓" : "✗"} ${c.name}${o?.reqSrc ? ` — ${formatReq(o.req)}` : ""}`;
          }}
        />
        {oath && oath.id !== "none" && (
          <div className={`oath-status ${oathEval?.met ? "met" : "unmet"}`}>
            <div className="oath-req">{oath.reqSrc ? formatReq(oath.req) : "No stat requirement"}</div>
            {oathEval?.met ? (
              <span>✓ Requirements met</span>
            ) : (
              <span>Need {oathEval?.missing.join(", ")}</span>
            )}
            <p className="field-blurb">{oath.blurb}</p>
          </div>
        )}
      </div>

      <div className="field-row">
        <Select label="Murmur" value={build.murmur} options={MURMURS} onChange={(murmur) => set({ murmur })} />
        <Select label="Bell" value={build.bell} options={BELLS} onChange={(bell) => set({ bell })} />
      </div>
      <div className="field-row">{slotList("boons", BOONS, "Boon")}</div>
      <div className="field-row">{slotList("flaws", FLAWS, "Flaw")}</div>
    </section>
  );
}

