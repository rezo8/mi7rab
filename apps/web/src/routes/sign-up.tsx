import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/features/auth/SignUpForm";

export const Route = createFileRoute("/sign-up")({
  component: SignUpForm,
});
