import { createFileRoute } from "@tanstack/react-router";
import { RitualScreen } from "@/features/ritual/RitualScreen";

export const Route = createFileRoute("/")({
  component: RitualScreen,
});
