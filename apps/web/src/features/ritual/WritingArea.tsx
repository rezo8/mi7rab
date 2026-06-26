import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onFirstInput: () => void;
}

export function WritingArea({ value, onChange, onFirstInput }: Props) {
  const started = useRef(false);

  return (
    <textarea
      className="writing-area"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={(e) => {
        if (!started.current && e.currentTarget.value.length > 0) {
          started.current = true;
          onFirstInput();
        }
      }}
      placeholder="begin."
      aria-label="Writing area"
      spellCheck={false}
      autoComplete="off"
    />
  );
}
