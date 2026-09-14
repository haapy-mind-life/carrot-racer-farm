import { createFileRoute } from "@tanstack/react-router";
import { Village } from "@/components/hyunjun/Village";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "박현준 게임 · 작은 마을" }] }),
  component: Village,
});
