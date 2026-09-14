import { createFileRoute } from "@tanstack/react-router";
import { Farm } from "@/components/hyunjun/Farm";
export const Route = createFileRoute("/greenhouse")({
  head: () => ({ meta: [{ title: "반짝 농장 · 박현준 게임" }] }),
  component: Farm,
});
