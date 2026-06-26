import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onFirstInput: () => void;
  onFocus?: () => void;
}

export function WritingArea({ value, onChange, onFirstInput, onFocus }: Props) {
  const started = useRef(false);

  return (
    <textarea
      id="ritual-text"
      className="writing-area"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={(e) => {
        if (!started.current && e.currentTarget.value.length > 0) {
          started.current = true;
          onFirstInput();
        }
      }}
      onFocus={onFocus}
      placeholder="…"
      aria-label="Writing area"
      spellCheck={false}
      autoComplete="off"
    />
  );
}
