import { useEffect, useRef } from "react";

interface Fleck {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
}

/**
 * Sparse, dim flecks sinking through a flat dark background. `depth` (0–1)
 * thins them out slightly as the build's Power rises.
 */
export function AbyssBackground({ depth }: { depth: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const depthRef = useRef(depth);
  depthRef.current = depth;

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let flecks: Fleck[] = [];
    let raf = 0;

    const spawn = (anywhere: boolean): Fleck => ({
      x: Math.random() * el.width,
      y: anywhere ? Math.random() * el.height : -4,
      r: Math.random() * 1.1 + 0.4,
      vy: Math.random() * 0.18 + 0.04,
      drift: Math.random() * 0.2 + 0.05,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = window.innerWidth * dpr;
      el.height = window.innerHeight * dpr;
      const count = Math.round((window.innerWidth * window.innerHeight) / 22000);
      flecks = Array.from({ length: count }, () => spawn(true));
    };

    const frame = (t: number) => {
      const alpha = 0.16 - depthRef.current * 0.06;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.fillStyle = `rgba(230, 220, 200, ${alpha})`;
      for (const f of flecks) {
        f.y += f.vy;
        f.x += Math.sin(t / 4000 + f.phase) * f.drift;
        if (f.y > el.height + 4) Object.assign(f, spawn(false));
        ctx.fillRect(f.x, f.y, f.r * 2, f.r * 2);
      }
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvas} className="abyss" aria-hidden />;
}
