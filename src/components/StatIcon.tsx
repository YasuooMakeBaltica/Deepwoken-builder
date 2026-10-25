import type { ReactNode } from "react";
import type { StatKey } from "../data/stats";

/** Six-armed snowflake: one vertical arm with chevrons, rotated three ways. */
const FROST_ARM = "M12 3v18M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5";

// Hand-drawn 24×24 line icons, stroked in the stat's color via currentColor.
const ICONS: Partial<Record<StatKey, ReactNode>> = {
  // Heavy: tilted war hammer, mirroring the dagger's angle
  HVY: (
    <g transform="rotate(-45 12 12)">
      <rect x="6" y="3" width="12" height="6.5" />
      <path d="M10 3v6.5M14 3v6.5M12 9.5v12" />
    </g>
  ),
  // Medium: upright longsword
  MED: <path d="M12 2l2 3v10h-4V5zM6.5 15h11M12 15v5M10.5 21.5h3" />,
  // Light: angled dagger
  LHT: <path transform="rotate(45 12 12)" d="M12 2l1.75 3.5V14h-3.5V5.5zM8 14h8M12 14v5M10.75 21h2.5" />,
  // Flamecharm: flame with inner tongue
  FIR: (
    <path d="M12 3c2 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 .5 2 1.5 3 2.5 3-.5-2.5-.5-5 .5-7zM12 20a2.5 2.5 0 0 1-2.5-2.5c0-1.6 1.5-2.5 2.5-4 1 1.5 2.5 2.4 2.5 4A2.5 2.5 0 0 1 12 20z" />
  ),
  // Frostdraw: snowflake
  ICE: (
    <>
      <path d={FROST_ARM} />
      <path d={FROST_ARM} transform="rotate(60 12 12)" />
      <path d={FROST_ARM} transform="rotate(120 12 12)" />
    </>
  ),
  // Thundercall: lightning bolt
  LTN: <path d="M13.5 2 5 13.5h6L10 22l9-12.5h-6z" />,
  // Galebreathe: curling gusts
  WND: <path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7" />,
  // Shadowcast: crescent with a small star
  SDW: <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10zM17 4v4M15 6h4" />,
  // Ironsing: anvil
  MTL: <path d="M3 6h13c0 2.5 2 4 5 4v2h-5l-2 3h-4l-2-3H5c-1.3 0-2-1-2-2.5zM10 15l-2 5h8l-2-5" />,
  // Bloodrend: blood drop
  BLD: (
    <path d="M12 3s-6 7-6 11.5a6 6 0 0 0 12 0C18 10 12 3 12 3zM9.5 15a2.5 2.5 0 0 0 2.5 2.5" />
  ),
};

export const hasStatIcon = (stat: StatKey) => stat in ICONS;

export function StatIcon({ stat, className = "stat-icon" }: { stat: StatKey; className?: string }) {
  const icon = ICONS[stat];
  if (!icon) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {icon}
    </svg>
  );
}
