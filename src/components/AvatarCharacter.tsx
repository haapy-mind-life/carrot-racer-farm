import { DEFAULT_AVATAR, getAvatarItem, type AvatarState } from "@/lib/avatar-system";

type AvatarCharacterProps = {
  equipped: AvatarState["equipped"];
  size?: "sm" | "md" | "lg";
  power?: "normal" | "invincible" | "flying";
  className?: string;
};

const sizeClass = {
  sm: "h-20 w-16",
  md: "h-40 w-32",
  lg: "h-64 w-52",
};

function visualFor(equipped: AvatarState["equipped"], category: keyof AvatarState["equipped"]) {
  return (
    getAvatarItem(equipped[category]) ??
    getAvatarItem(DEFAULT_AVATAR.equipped[category])!
  ).visual;
}

export function AvatarCharacter({
  equipped,
  size = "md",
  power = "normal",
  className = "",
}: AvatarCharacterProps) {
  const hair = visualFor(equipped, "hair");
  const top = visualFor(equipped, "top");
  const bottom = visualFor(equipped, "bottom");
  const shoes = visualFor(equipped, "shoes");

  return (
    <div
      className={`relative inline-block ${sizeClass[size]} ${className}`}
      aria-label="꾸민 캐릭터"
      role="img"
    >
      {power === "flying" && (
        <>
          <span className="absolute left-[-18%] top-[42%] text-[2em]" aria-hidden="true">🪽</span>
          <span className="absolute right-[-18%] top-[42%] -scale-x-100 text-[2em]" aria-hidden="true">🪽</span>
        </>
      )}

      {power === "invincible" && (
        <>
          <span className="absolute -left-2 top-[12%] animate-pulse text-[1.3em]" aria-hidden="true">✨</span>
          <span className="absolute -right-2 top-[45%] animate-pulse text-[1.3em]" aria-hidden="true">⭐</span>
        </>
      )}

      <div
        className={`absolute inset-x-[18%] top-[8%] bottom-[5%] rounded-[45%_45%_30%_30%] border-2 border-border bg-card shadow-sm ${power === "invincible" ? "ring-4 ring-accent/60" : ""}`}
      >
        <div className="absolute left-1/2 top-[10%] aspect-square w-[58%] -translate-x-1/2 rounded-full border-2 border-border bg-orange-100">
          <span className="absolute left-[23%] top-[40%] h-[7%] w-[7%] rounded-full bg-foreground" />
          <span className="absolute right-[23%] top-[40%] h-[7%] w-[7%] rounded-full bg-foreground" />
          <span className="absolute left-1/2 top-[62%] h-[6%] w-[24%] -translate-x-1/2 rounded-b-full border-b-2 border-foreground" />
        </div>

        <span className="absolute left-1/2 top-[-4%] -translate-x-1/2 text-[1.55em] leading-none" aria-hidden="true">
          {hair}
        </span>
        <span className="absolute left-1/2 top-[45%] -translate-x-1/2 text-[1.6em] leading-none" aria-hidden="true">
          {top}
        </span>
        <span className="absolute left-1/2 top-[66%] -translate-x-1/2 text-[1.45em] leading-none" aria-hidden="true">
          {bottom}
        </span>
        <span className="absolute left-1/2 bottom-[0%] -translate-x-1/2 text-[1.25em] leading-none" aria-hidden="true">
          {shoes}
        </span>
      </div>
    </div>
  );
}
