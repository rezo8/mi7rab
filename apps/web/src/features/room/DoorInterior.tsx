import { useEffect, useState, type CSSProperties } from "react";
import type { Door } from "./doors";
import { MomentCard } from "./MomentCard";
import { CardFocusOverlay } from "./CardFocusOverlay";

interface Props {
  door: Door;
  onBack: () => void;
}

const CARD_COUNT = 52;
const CARD_W = 90;
const CARD_H = 154;
const HUD_CLEARANCE = 280;

interface CardData {
  x: number;
  y: number;
  rotation: number;
  faceUp: boolean;
  delay: number;
}

function generateCards(): CardData[] {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const cx = W * 0.5;
  const cy = H * 0.45;
  const faceUpProb = 0.1 + Math.random() * 0.8;

  return Array.from({ length: CARD_COUNT }, (_, i) => {
    const left = CARD_W * 0.1 + Math.random() * (W - CARD_W * 0.2);
    const top  = HUD_CLEARANCE + Math.random() * (H - HUD_CLEARANCE - CARD_H * 0.2);
    return {
      x: left - cx,
      y: top  - cy,
      rotation: (Math.random() - 0.5) * 340,
      faceUp: Math.random() < faceUpProb,
      delay: i * 18,
    };
  });
}

export function DoorInterior({ door, onBack }: Props) {
  const [cards, setCards] = useState<CardData[]>(generateCards);
  const [scattered, setScattered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Reset to eye point, then scatter on the next paint.
  useEffect(() => {
    setScattered(false);
    let id1: number, id2: number;
    id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setScattered(true));
    });
    return () => { cancelAnimationFrame(id1); cancelAnimationFrame(id2); };
  }, [cards]);

  const handleShuffle = () => {
    setScattered(false);
    setCards(generateCards());
  };

  const cardStyle = (card: CardData): CSSProperties => ({
    left: "50%",
    top: "45%",
    transform: scattered
      ? `translate(calc(-50% + ${card.x}px), calc(-50% + ${card.y}px)) rotate(${card.rotation}deg)`
      : `translate(calc(-50% + ${card.x}px), calc(-50% + ${card.y}px)) scale(1.5) rotate(${card.rotation}deg)`,
    opacity: scattered ? 1 : 0,
    transition: scattered
      ? `transform 1400ms cubic-bezier(0.22, 0.61, 0.36, 1) ${card.delay}ms, opacity 80ms ease ${card.delay}ms`
      : "none",
  });

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
          <button type="button" className="hud-btn" onClick={() => setFocused(true)}>
            draw a card
          </button>
        </div>
      </div>

      <div className="door-interior-cards" aria-hidden="true">
        {cards.map((card, i) => (
          <MomentCard
            key={i}
            door={door}
            faceUp={card.faceUp}
            style={cardStyle(card)}
            onClick={() => setFocused(true)}
          />
        ))}
      </div>

      {focused && (
        <CardFocusOverlay door={door} onDismiss={() => setFocused(false)} />
      )}
    </div>
  );
}
