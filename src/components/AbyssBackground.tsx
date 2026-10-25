import { useEffect, useRef, type CSSProperties } from "react";

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  hue: number;
}

/**
 * Drifting "marine snow" with occasional bioluminescent motes. `depth` (0–1)
 * darkens the water and makes the glowing motes more frequent.
 */
export function AbyssBackground({ depth }: { depth: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const depthRef = useRef(depth);
  depthRef.current = depth;

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let motes: Mote[] = [];
    let raf = 0;

    const spawn = (anywhere: boolean): Mote => ({
      x: Math.random() * el.width,
      y: anywhere ? Math.random() * el.height : -10,
      r: Math.random() * 1.6 + 0.3,
      vy: Math.random() * 0.25 + 0.05,
      drift: Math.random() * 0.3 + 0.1,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.12 ? 170 + Math.random() * 60 : -1,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = window.innerWidth * dpr;
      el.height = window.innerHeight * dpr;
      const count = Math.round((window.innerWidth * window.innerHeight) / 9000);
      motes = Array.from({ length: count }, () => spawn(true));
    };

    const frame = (t: number) => {
      const d = depthRef.current;
      ctx.clearRect(0, 0, el.width, el.height);
      for (const m of motes) {
        m.y += m.vy;
        m.x += Math.sin(t / 3000 + m.phase) * m.drift;
        if (m.y > el.height + 10) Object.assign(m, spawn(false));
        const glow = m.hue >= 0;
        const pulse = glow ? 0.5 + 0.5 * Math.sin(t / 700 + m.phase) : 1;
        const alpha = glow ? (0.25 + 0.6 * d) * pulse : 0.18 + 0.12 * (1 - d);
        ctx.beginPath();
        ctx.fillStyle = glow ? `hsla(${m.hue}, 100%, 70%, ${alpha})` : `rgba(200, 225, 255, ${alpha})`;
        if (glow) {
          ctx.shadowColor = `hsla(${m.hue}, 100%, 65%, ${alpha})`;
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(m.x, m.y, glow ? m.r * 1.8 : m.r, 0, Math.PI * 2);
        ctx.fill();
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

  return (
    <div className="abyss" style={{ "--depth": depth } as CSSProperties} aria-hidden>
      <div className="abyss-water" />
      <div className="abyss-rays" />
      <canvas ref={canvas} className="abyss-snow" />
    </div>
  );
}
