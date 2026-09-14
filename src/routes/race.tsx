import { createFileRoute } from "@tanstack/react-router";
import { Runner } from "@/components/hyunjun/Runner";
export const Route = createFileRoute("/race")({
  head: () => ({ meta: [{ title: "박현준 러너" }] }),
  component: Runner,
});
