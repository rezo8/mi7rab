import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signInError } = await signIn.email({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message ?? "That didn't open. Check your details.");
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <main id="main" className="page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="wordmark">mihrab</p>
        <h1 className="auth-title">Return to the niche</h1>
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" busy={busy}>
          {busy ? "Opening…" : "Enter"}
        </Button>
        <p className="auth-alt">
          First time here?{" "}
          <Link to="/sign-up" className="link-quiet">
            Make a niche.
          </Link>
        </p>
      </form>
    </main>
  );
}
