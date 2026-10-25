# Abyssal Builder — a Deepwoken build planner

A fan-made Deepwoken character planner inspired by [deepwoken.co/builder](https://deepwoken.co/builder), with a deep-ocean
look: drifting marine snow, bioluminescent stat glows, and a background that grows darker the deeper your Power goes.

> Not affiliated with or endorsed by Deepwoken or its developers.

## Features

- **Stats**: 6 attributes, 3 weapon types and 7 attunements with sliders, ±1/5/10 controls and a 330-point budget.
  Power is derived from points spent, and racial bonuses are applied on top.
- **Character**: race, origin, oath (with live requirement checks), murmur, bell, boons and flaws.
- **Talents**: search plus rarity and status filters. Locked cards show exactly what you're missing (e.g. `Need STR +5`),
  and **Within reach** lists your cheapest next unlocks. Talent and faction caps are enforced.
- **Mantras**: Combat, Mobility, Support and Wisp, with slot tracking (overflow goes to the wildcard slot).
- **Stat ribbon**: hover any requirement to light up the stats it depends on.
- **Summary**: estimated derived stats, identity, stat spread, kit and build validation.
- **Share links**: the whole build is encoded in the URL hash. Undo/redo (Ctrl+Z / Ctrl+Shift+Z) and local autosave.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (vitest)
npm run build    # static site in dist/ (relative paths, works on GitHub Pages)
```

## Game data

All game data lives in editable JSON under `src/data/`. Race bonuses, oath requirements, bells and origins match the
reference builder. Talent and mantra details, and the derived-stat formulas in `src/lib/build.ts`, are **best-effort
approximations**, so corrections are welcome.

Requirements use a small expression language (`src/lib/requirements.ts`):

| Syntax                     | Meaning                         |
| -------------------------- | ------------------------------- |
| `STR 25`                   | at least 25 Strength            |
| `comb(HVY,MED,LHT) 75`     | combined total of several stats |
| `LVL 15`                   | Power 15                        |
| `A & B`, `A \| B`, `( )`   | and / or (`&` binds tighter)    |

Stat keys: `STR FTD AGL INT WLL CHA HVY MED LHT FIR ICE LTN WND SDW MTL BLD`.
Talents may also set `"murmur"` or `"origin"` to gate them behind that choice.

Tunable rules (point pool, points per Power, caps, mantra slots) are in `RULES` in `src/lib/game.ts`.
