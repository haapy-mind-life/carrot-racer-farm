import { Link } from "@tanstack/react-router";

export function HomeButton() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-5 py-2 text-lg text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
    >
      🏡 집으로 돌아가기
    </Link>
  );
}
