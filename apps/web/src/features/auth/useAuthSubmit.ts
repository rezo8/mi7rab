import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";

type AuthResult = { error?: { message?: string } | null };

/**
 * Shared submit/busy/error state machine for the auth forms: runs the Better
 * Auth call, surfaces its error message (or a fallback), and navigates home on
 * success. Each form just declares its fields and which call to make.
 */
export function useAuthSubmit(run: () => Promise<AuthResult>, fallbackMessage: string) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: submitError } = await run();
    setBusy(false);
    if (submitError) {
      setError(submitError.message ?? fallbackMessage);
      return;
    }
    void navigate({ to: "/" });
  }

  return { busy, error, onSubmit };
}
