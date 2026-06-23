import { createFileRoute } from "@tanstack/react-router";
import { ObliqueScreen } from "@/features/oblique/ObliqueScreen";

export const Route = createFileRoute("/")({
  component: ObliqueScreen,
});
