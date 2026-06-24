import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { useAuthSubmit } from "./useAuthSubmit";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { busy, error, onSubmit } = useAuthSubmit(
    () => signIn.email({ email, password }),
    "That didn't open. Check your details.",
  );

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
