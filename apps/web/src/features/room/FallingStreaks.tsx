import { useEffect, useRef } from "react";

interface Streak {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number;
  alpha: number;
  width: number;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function FallingStreaks({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetColorRef = useRef(hexToRgb(color));
  const displayColorRef = useRef<[number, number, number]>([...targetColorRef.current]);
  const streaksRef = useRef<Streak[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    targetColorRef.current = hexToRgb(color);
  }, [color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const count = Math.max(60, Math.floor(window.innerWidth / 14));
    streaksRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: 0.35 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.12,
      length: 35 + Math.random() * 65,
      alpha: 0.12 + Math.random() * 0.45,
      width: 0.5 + Math.random() * 1.1,
    }));

    function draw() {
      if (!canvas || !ctx) return;

      // Smoothly track the target color (~1.5 s to converge)
      const [tr, tg, tb] = targetColorRef.current;
      const [dr, dg, db] = displayColorRef.current;
      displayColorRef.current = [lerp(dr, tr, 0.04), lerp(dg, tg, 0.04), lerp(db, tb, 0.04)];
      const r = Math.round(displayColorRef.current[0]);
      const g = Math.round(displayColorRef.current[1]);
      const b = Math.round(displayColorRef.current[2]);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of streaksRef.current) {
        s.y += s.vy;
        s.x += s.vx;

        if (s.y - s.length / 2 > canvas.height) {
          s.y = -s.length / 2;
          s.x = Math.random() * canvas.width;
        }

        const grad = ctx.createLinearGradient(s.x, s.y - s.length / 2, s.x, s.y + s.length / 2);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.35, `rgba(${r},${g},${b},${s.alpha})`);
        grad.addColorStop(0.65, `rgba(${r},${g},${b},${s.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.x, s.y - s.length / 2);
        ctx.lineTo(s.x, s.y + s.length / 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }}
    />
  );
}
