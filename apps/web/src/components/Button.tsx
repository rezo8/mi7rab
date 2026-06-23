import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  busy?: boolean;
  children: ReactNode;
}

export function Button({ busy, children, className = "", disabled, ...rest }: Props) {
  return (
    <button className={`btn ${className}`.trim()} aria-busy={busy} disabled={busy || disabled} {...rest}>
      {children}
    </button>
  );
}
