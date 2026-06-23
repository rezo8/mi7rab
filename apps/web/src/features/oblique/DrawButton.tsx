interface Props {
  onDraw: () => void;
  isFetching: boolean;
}

export function DrawButton({ onDraw, isFetching }: Props) {
  return (
    <button
      type="button"
      className="draw"
      onClick={onDraw}
      disabled={isFetching}
      aria-busy={isFetching}
      aria-label="Draw another strategy"
    >
      <span className="draw-mark" aria-hidden="true" />
      {isFetching ? "Drawing…" : "Draw another"}
    </button>
  );
}
