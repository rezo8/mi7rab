import { useEffect, useRef, useState } from "react";
import type { Door } from "./doors";

interface Props {
  door: Door;
  onBack: () => void;
}

const VIDEO_W = 200;
const VIDEO_H = 113; // 16:9
const ZOOM_STEP = 0.2;
const ZOOM_MAX  = 1.0;

interface BloodStreak {
  x: number;
  drawnToX: number;
  currentY: number;
  endY: number;
  vy: number;
  vx: number;
  ax: number;
  width: number;
  alpha: number;
  drawnTo: number;
  done: boolean;
}

type YTPlayer = { playVideo: () => void; destroy: () => void };

const TUNNEL_LINE_COLOR = "#b8b8b8";
const BLOOD_COLOR = "rgba(178, 10, 10,";

let _instanceCount = 0;

export function SafetySceneMickey({ door, onBack }: Props) {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const playerRef       = useRef<YTPlayer | null>(null);
  const streaksRef      = useRef<BloodStreak[]>([]);
  const rafRef          = useRef<number>(0);
  const timeoutRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startSpawnRef   = useRef<(() => void) | null>(null);
  const bloodStartedRef = useRef(false);
  const zoomRef         = useRef(0);
  const playerId        = useRef(`yt-safety-${++_instanceCount}`);

  const [dim, setDim]       = useState({ w: window.innerWidth, h: window.innerHeight });
  const [zoom, setZoom]     = useState(0); // 0 = far, 1 = very close

  // Keep zoomRef in sync so the canvas draw loop can read the live value.
  zoomRef.current = zoom;

  // Derived from zoom
  const scale      = 1 + zoom * 3.5;           // 1× → 4.5× at max
  const bloodOpacity = Math.max(0, 1 - zoom * 1.4); // fades out before full zoom
  const effW = VIDEO_W * scale;
  const effH = VIDEO_H * scale;

  useEffect(() => {
    const handler = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp")   { e.preventDefault(); setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))); }
      if (e.key === "ArrowDown") { e.preventDefault(); setZoom(z => Math.max(0,        +(z - ZOOM_STEP).toFixed(2))); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Two-canvas approach: offscreen accumulates all strokes (including video zone);
  // display canvas clears + composites each frame, then punches the video-zone hole.
  // This means zoom-out restores blood that was hidden — it was always there offscreen.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const off = document.createElement("canvas");
    off.width  = canvas.width;
    off.height = canvas.height;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;

    let spawnCount = 0;

    function spawnStreak() {
      const W      = window.innerWidth;
      const vLeft  = W / 2 - VIDEO_W / 2;
      const vRight = W / 2 + VIDEO_W / 2;

      let x: number;
      const r = Math.random();
      if      (r < 0.28) x = Math.random() * vLeft * 0.9;
      else if (r < 0.56) x = vRight + Math.random() * (W - vRight) * 0.9;
      else if (r < 0.72) x = vLeft + Math.random() * VIDEO_W;
      else               x = Math.random() * W;

      const startY = -50 - Math.random() * 80;
      const vx = (Math.random() - 0.5) * 0.35;
      streaksRef.current.push({
        x,
        drawnToX: x,
        currentY: startY,
        endY:     window.innerHeight + 10,
        vy:       1.2 + Math.random() * 2.2,
        vx,
        ax:       (Math.random() - 0.5) * 0.012,
        width:    1.5 + Math.random() * 3.0,
        alpha:    0.60 + Math.random() * 0.35,
        drawnTo:  startY,
        done:     false,
      });
      spawnCount++;
    }

    function scheduleNext() {
      const ms = Math.max(820, 3000 - spawnCount * 230);
      timeoutRef.current = setTimeout(() => {
        spawnStreak();
        scheduleNext();
      }, ms);
    }

    startSpawnRef.current = () => {
      spawnStreak();
      scheduleNext();
    };

    function draw() {
      if (!ctx || !canvas || !offCtx) return;

      // 1. Accumulate new segments onto offscreen (never clears — blood is permanent here).
      for (const s of streaksRef.current) {
        if (s.done) continue;
        s.currentY += s.vy;
        s.vx += s.ax;
        // Gently reverse ax when drift gets too wide, keeping paths natural
        if (Math.abs(s.vx) > 0.45) s.ax *= -0.7;
        s.x += s.vx;
        if (s.currentY >= s.endY) { s.currentY = s.endY; s.done = true; }
        if (s.currentY > s.drawnTo + 0.4) {
          offCtx.beginPath();
          offCtx.strokeStyle = `${BLOOD_COLOR} ${s.alpha})`;
          offCtx.lineWidth   = s.width;
          offCtx.lineCap     = "round";
          offCtx.moveTo(s.drawnToX, s.drawnTo);
          offCtx.lineTo(s.x, s.currentY);
          offCtx.stroke();
          s.drawnTo   = s.currentY;
          s.drawnToX  = s.x;
        }
      }

      // 2. Composite to display: clear, copy offscreen, punch the video-zone hole.
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(off, 0, 0);

      const liveScale = 1 + zoomRef.current * 3.5;
      const pad       = 14;
      const eraseW    = VIDEO_W * liveScale + pad * 2;
      const eraseH    = VIDEO_H * liveScale + pad * 2;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(
        canvas.width  / 2 - eraseW / 2,
        canvas.height / 2 - eraseH / 2,
        eraseW, eraseH,
      );
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // YouTube iframe API
  useEffect(() => {
    const id = playerId.current;

    function createPlayer() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerRef.current = new (window as any).YT.Player(id, {
        width:  VIDEO_W,
        height: VIDEO_H,
        videoId: "I5pG1wbRKOg",
        playerVars: { controls: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange(e: { data: number }) {
            if (e.data === 1 && !bloodStartedRef.current) {
              bloodStartedRef.current = true;
              startSpawnRef.current?.();
            }
          },
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).YT?.Player) {
      createPlayer();
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const prev = (window as any).onYouTubeIframeAPIReady as (() => void) | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).onYouTubeIframeAPIReady = () => { prev?.(); createPlayer(); };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function moveCloser()  { setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))); }
  function moveAway()    { setZoom(z => Math.max(0,        +(z - ZOOM_STEP).toFixed(2))); }

  const { w, h } = dim;
  const vLeft   = w / 2 - effW / 2;
  const vRight  = w / 2 + effW / 2;
  const vTop    = h / 2 - effH / 2;
  const vBottom = h / 2 + effH / 2;

  // Red (#b80e0e) → black as zoom increases
  const titleR = Math.round(184 * (1 - zoom));
  const titleG = Math.round(14  * (1 - zoom));
  const titleB = Math.round(14  * (1 - zoom));
  const titleColor = `rgb(${titleR},${titleG},${titleB})`;

  const lerp   = (a: number, b: number, t: number) => a + (b - a) * t;
  const depths = [0.12, 0.25, 0.40, 0.55, 0.70, 0.84];

  return (
    <div className="safety-scene">
      <nav className="corner corner--right">
        <button type="button" className="safety-back" onClick={onBack}>
          ← back
        </button>
      </nav>

      <div className="door-interior-hud safety-hud">
        <p className="wordmark" lang="ar" dir="rtl" style={{ color: titleColor, transition: "color 0.5s ease" }}>مِحراب</p>
        <p
          className="door-interior-name safety-door-name"
          lang="ar"
          dir="rtl"
          style={{ color: titleColor, transition: "color 0.5s ease" }}
        >
          {door.labelAr}
        </p>
      </div>

      {/* Perspective tunnel — updates with zoom */}
      <svg
        className="safety-tunnel"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line x1={0} y1={0} x2={vLeft}  y2={vTop}    stroke={TUNNEL_LINE_COLOR} strokeWidth="0.9" opacity="0.55" />
        <line x1={w} y1={0} x2={vRight} y2={vTop}    stroke={TUNNEL_LINE_COLOR} strokeWidth="0.9" opacity="0.55" />
        <line x1={0} y1={h} x2={vLeft}  y2={vBottom} stroke={TUNNEL_LINE_COLOR} strokeWidth="0.9" opacity="0.55" />
        <line x1={w} y1={h} x2={vRight} y2={vBottom} stroke={TUNNEL_LINE_COLOR} strokeWidth="0.9" opacity="0.55" />

        {depths.map((t) => {
          const rl = lerp(0, vLeft,   t);
          const rr = lerp(w, vRight,  t);
          const rt = lerp(0, vTop,    t);
          const rb = lerp(h, vBottom, t);
          return (
            <rect
              key={t}
              x={rl} y={rt}
              width={rr - rl} height={rb - rt}
              fill="none"
              stroke={TUNNEL_LINE_COLOR}
              strokeWidth={Math.max(0.25, 1.1 - t * 0.9)}
              opacity={Math.max(0.08, 0.50 - t * 0.42)}
            />
          );
        })}

        <rect
          x={vLeft} y={vTop}
          width={effW} height={effH}
          fill="white" stroke="#aaaaaa" strokeWidth="1" opacity="0.6"
        />
      </svg>

      {/* Video — CSS scale drives the zoom; YT.Player replaces the inner div */}
      <div
        className="safety-video"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        <div id={playerId.current} />
      </div>

      {/* Zoom controls — toward / away */}
      <div className="safety-zoom-controls">
        <button
          type="button"
          className="safety-zoom-btn"
          onClick={moveCloser}
          disabled={zoom >= ZOOM_MAX}
          aria-label="Move closer"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,4 20,20 4,20" /></svg>
        </button>
        <button
          type="button"
          className="safety-zoom-btn"
          onClick={moveAway}
          disabled={zoom <= 0}
          aria-label="Move away"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,20 4,4 20,4" /></svg>
        </button>
      </div>

      {/* Blood — opacity fades as you move closer */}
      <canvas
        ref={canvasRef}
        className="safety-blood"
        style={{ opacity: bloodOpacity, transition: "opacity 0.6s ease" }}
        aria-hidden="true"
      />
    </div>
  );
}
