import { useEffect, useReducer } from "react";
import type { StatKey } from "../data/stats";
import { newBuild, pointsSpent, type Build } from "./build";
import { RULES } from "./game";
import { decodeBuild, encodeBuild } from "./share";

export type Action =
  | { type: "setStat"; stat: StatKey; value: number }
  | { type: "set"; patch: Partial<Omit<Build, "invested">> }
  | { type: "toggleTalent"; id: string }
  | { type: "toggleMantra"; id: string }
  | { type: "reset" }
  | { type: "load"; build: Build }
  | { type: "undo" }
  | { type: "redo" };

interface History {
  past: Build[];
  present: Build;
  future: Build[];
  /** Used to merge rapid edits of the same stat into one undo step. */
  lastKey?: string;
  lastAt: number;
}

const HISTORY_LIMIT = 200;
const COALESCE_MS = 700;
const STORAGE_KEY = "abyssal-builder:v1";

const toggle = (xs: string[], id: string) =>
  xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id];

function apply(b: Build, a: Action): Build {
  switch (a.type) {
    case "setStat": {
      const others = pointsSpent(b) - b.invested[a.stat];
      const budget = RULES.totalPoints - others;
      const value = Math.max(0, Math.min(RULES.statCap, budget, Math.round(a.value)));
      return { ...b, invested: { ...b.invested, [a.stat]: value } };
    }
    case "set":
      return { ...b, ...a.patch };
    case "toggleTalent":
      return { ...b, talents: toggle(b.talents, a.id) };
    case "toggleMantra":
      return { ...b, mantras: toggle(b.mantras, a.id) };
    case "reset":
      return newBuild();
    case "load":
      return a.build;
    default:
      return b;
  }
}

function reducer(h: History, a: Action): History {
  if (a.type === "undo") {
    if (!h.past.length) return h;
    return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], lastAt: 0 };
  }
  if (a.type === "redo") {
    if (!h.future.length) return h;
    return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), lastAt: 0 };
  }
  const next = apply(h.present, a);
  if (next === h.present) return h;
  const key = a.type === "setStat" ? `stat:${a.stat}` : a.type === "set" && "name" in a.patch ? "name" : undefined;
  const now = Date.now();
  if (key && key === h.lastKey && now - h.lastAt < COALESCE_MS) {
    return { ...h, present: next, future: [], lastAt: now };
  }
  return {
    past: [...h.past, h.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
    lastKey: key,
    lastAt: now,
  };
}

function initial(): History {
  const hash = new URLSearchParams(window.location.hash.slice(1)).get("b");
  let present: Build | null = hash ? decodeBuild(hash) : null;
  if (!present) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      present = saved ? decodeBuild(saved) : null;
    } catch {
      present = null;
    }
  }
  return { past: [], present: present ?? newBuild(), future: [], lastAt: 0 };
}

export function useBuild() {
  const [h, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, encodeBuild(h.present));
    } catch {
      // Storage may be unavailable (private mode); the build still works in memory.
    }
  }, [h.present]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    build: h.present,
    dispatch,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
  };
}
