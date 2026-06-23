import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { signUp } from "@/lib/auth/auth-client";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";

export function SignUpForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: signUpError } = await signUp.email({ name, email, password });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message ?? "Couldn't make a niche. Try a different email or a longer password.");
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <main id="main" className="page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="wordmark">mihrab</p>
        <h1 className="auth-title">Make a niche</h1>
        <Field label="Name" value={name} onChange={setName} autoComplete="name" required />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" busy={busy}>
          {busy ? "Opening…" : "Begin"}
        </Button>
        <p className="auth-alt">
          Already have one?{" "}
          <Link to="/sign-in" className="link-quiet">
            Return to the niche.
          </Link>
        </p>
      </form>
    </main>
  );
}
