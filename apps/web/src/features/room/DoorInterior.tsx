import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MomentSummary } from "@mihrab/shared";
import type { Door } from "./doors";
import { MomentCard } from "./MomentCard";
import { CardFocusOverlay } from "./CardFocusOverlay";
import { FallingStreaks } from "./FallingStreaks";
import { useMoments } from "./useMoments";
import { signedUrlQueryOptions } from "./useMomentImageUrl";

interface Props {
  door: Door;
  onBack: () => void;
}

const CARD_W = 90;
const CARD_H = 154;
const HUD_CLEARANCE = 280;

interface CardLayout {
  x: number;
  y: number;
  rotation: number;
  faceUp: boolean;
  delay: number;
  zIndex: number;
}

function generateLayouts(count: number): CardLayout[] {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W * 0.5;
  const cy = H * 0.45;
  const faceUpProb = 0.1 + Math.random() * 0.8;

  return Array.from({ length: count }, (_, i) => {
    const left = CARD_W * 0.1 + Math.random() * (W - CARD_W * 0.2);
    const top  = HUD_CLEARANCE + Math.random() * (H - HUD_CLEARANCE - CARD_H * 0.2);
    return {
      x: left - cx,
      y: top  - cy,
      rotation: (Math.random() - 0.5) * 340,
      faceUp: Math.random() < faceUpProb,
      delay: i * 18,
      zIndex: i + 1,
    };
  });
}

export function DoorInterior({ door, onBack }: Props) {
  const { moments } = useMoments(door.id);
  const queryClient = useQueryClient();
  const [layouts, setLayouts] = useState<CardLayout[]>([]);
  const [scattered, setScattered] = useState(false);
  // scatterVersion drives the animation — layouts changes alone do NOT retrigger scatter.
  const [scatterVersion, setScatterVersion] = useState(0);
  const [focused, setFocused] = useState<MomentSummary | null>(null);

  const maxZRef = useRef(52);
  const cardElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastDragMovedRef = useRef(false);
  const dragRef = useRef<{
    index: number;
    startX: number;
    startY: number;
    cardX: number;
    cardY: number;
    rotation: number;
    moved: boolean;
  } | null>(null);

  // Track current drag position in a ref so incidental re-renders use the right transform.
  const dragPosRef = useRef<{ index: number; x: number; y: number } | null>(null);

  // When moments arrive, fetch all cover image URLs then preload pixels — then scatter once.
  useEffect(() => {
    if (moments.length === 0) return;
    let cancelled = false;

    const coverKeys = [...new Set(
      moments.map(m => m.coverImageKey).filter(Boolean) as string[]
    )];

    async function preloadAndScatter() {
      // 1. Fetch signed URLs (uses React Query cache — same keys as useMomentImageUrl)
      const urlResults = await Promise.allSettled(
        coverKeys.map(key => queryClient.fetchQuery(signedUrlQueryOptions(key)))
      );
      if (cancelled) return;

      // 2. Pre-load image pixels into the browser cache
      const urls = urlResults
        .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
        .map(r => r.value);
      await Promise.allSettled(
        urls.map(url => new Promise<void>(resolve => {
          const img = new Image();
          img.onload = img.onerror = () => resolve();
          img.src = url;
        }))
      );
      if (cancelled) return;

      // 3. Scatter — fired exactly once, no intermediate state flips
      maxZRef.current = moments.length + 1;
      setLayouts(generateLayouts(moments.length));
      setScatterVersion(v => v + 1);
    }

    void preloadAndScatter();
    return () => { cancelled = true; };
  }, [moments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scatter animation — resets cards to origin then flies them out.
  useEffect(() => {
    if (scatterVersion === 0) return;
    setScattered(false);
    let id1: number, id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setScattered(true));
    });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
  }, [scatterVersion]);

  const handleShuffle = () => {
    dragPosRef.current = null;
    setLayouts(generateLayouts(moments.length));
    setScatterVersion(v => v + 1);
  };

  const handleDraw = () => {
    if (moments.length === 0) return;
    setFocused(moments[Math.floor(Math.random() * moments.length)]!);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    if (!scattered) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const layout = layouts[index]!;
    dragRef.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      cardX: layout.x,
      cardY: layout.y,
      rotation: layout.rotation,
      moved: false,
    };
    maxZRef.current++;
    const z = maxZRef.current;
    const el = cardElsRef.current[index];
    if (el) {
      el.style.zIndex = String(z);
      el.style.cursor = "grabbing";
      el.style.transition = "none";
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { index, startX, startY, cardX, cardY, rotation } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) dragRef.current.moved = true;
    const newX = cardX + dx;
    const newY = cardY + dy;
    dragPosRef.current = { index, x: newX, y: newY };
    const el = cardElsRef.current[index];
    if (el) {
      el.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px)) rotate(${rotation}deg)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const { index, startX, startY, cardX, cardY, moved } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const finalX = cardX + dx;
    const finalY = cardY + dy;
    const z = maxZRef.current;
    lastDragMovedRef.current = moved; // onClick fires after pointerUp; carry the flag across
    dragRef.current = null;
    dragPosRef.current = null;

    const el = cardElsRef.current[index];
    if (el) el.style.cursor = "grab";

    // Commit final position — does NOT increment scatterVersion, so no animation retrigger.
    setLayouts(prev => prev.map((l, i) =>
      i === index ? { ...l, x: finalX, y: finalY, zIndex: z } : l
    ));
  };

  const cardStyle = (card: CardLayout, index: number): CSSProperties => {
    // During drag, use the live drag position so any incidental re-render is correct.
    const pos = dragPosRef.current?.index === index
      ? { x: dragPosRef.current.x, y: dragPosRef.current.y }
      : { x: card.x, y: card.y };
    const isDragging = dragPosRef.current?.index === index;

    return {
      left: "50%",
      top: "45%",
      zIndex: card.zIndex,
      transform: scattered
        ? `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) rotate(${card.rotation}deg)`
        : `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(1.5) rotate(${card.rotation}deg)`,
      opacity: scattered ? 1 : 0,
      transition: isDragging
        ? "none"
        : scattered
        ? `transform 1400ms cubic-bezier(0.22, 0.61, 0.36, 1) ${card.delay}ms, opacity 80ms ease ${card.delay}ms`
        : "none",
    };
  };

  return (
    <div className="door-interior">
      <nav className="corner corner--right">
        <button type="button" className="link-quiet" onClick={onBack}>
          ← back
        </button>
      </nav>

      <div className="door-interior-hud">
        <p className="wordmark" lang="ar" dir="rtl">مِحراب</p>
        <p className="door-interior-name" lang="ar" dir="rtl">
          {door.labelAr}
        </p>
        <div className="door-interior-actions">
          <button type="button" className="hud-btn" onClick={handleShuffle}>
            shuffle
          </button>
          <button type="button" className="hud-btn" onClick={handleDraw}>
            draw a card
          </button>
        </div>
      </div>

      <FallingStreaks color={door.colors.streakColor ?? door.colors.arch} />

      <div className="door-interior-cards" aria-hidden="true">
        {layouts.map((layout, i) => (
          <MomentCard
            key={i}
            door={door}
            moment={moments[i]}
            faceUp={layout.faceUp}
            style={cardStyle(layout, i)}
            cardRef={(el) => { cardElsRef.current[i] = el; }}
            onClick={() => {
              if (lastDragMovedRef.current) {
                lastDragMovedRef.current = false;
                return;
              }
              if (!layout.faceUp) {
                setLayouts(prev => prev.map((l, j) => j === i ? { ...l, faceUp: true } : l));
              }
              setFocused(moments[i] ?? null);
            }}
            onPointerDown={(e) => handlePointerDown(e, i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        ))}
      </div>

      {focused && (
        <CardFocusOverlay
          door={door}
          moment={focused}
          onDismiss={() => setFocused(null)}
        />
      )}
    </div>
  );
}
