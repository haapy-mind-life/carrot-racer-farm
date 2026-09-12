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

function styleKeyFor(equipped: AvatarState["equipped"], category: keyof AvatarState["equipped"]) {
  return (
    getAvatarItem(equipped[category]) ??
    getAvatarItem(DEFAULT_AVATAR.equipped[category])!
  ).styleKey;
}

function hairColor(style: string) {
  if (style === "hair-blue") return "#3158c9";
  if (style === "hair-star") return "#6d4bd1";
  if (style === "hair-crown") return "#2f2530";
  if (style === "hair-swoop") return "#7b4b2a";
  return "#3b2b28";
}

function topColor(style: string) {
  if (style === "top-green") return "#4da66a";
  if (style === "top-sport") return "#ef5d5d";
  if (style === "top-hoodie") return "#4c5c78";
  if (style === "top-rainbow") return "#8a64d6";
  if (style === "top-hero") return "#3154c8";
  return "#f1a44f";
}

function bottomColor(style: string) {
  if (style === "bottom-jeans") return "#3d67a8";
  if (style === "bottom-green") return "#4d8f62";
  if (style === "bottom-sport") return "#2e3848";
  if (style === "bottom-gold") return "#d7a928";
  return "#7d91b1";
}

function shoeColor(style: string) {
  if (style === "shoes-blue") return "#3c73dc";
  if (style === "shoes-red") return "#df4d4d";
  if (style === "shoes-boots") return "#765138";
  if (style === "shoes-rocket") return "#c6cad3";
  return "#f6f2e9";
}

export function AvatarCharacter({
  equipped,
  size = "md",
  power = "normal",
  className = "",
}: AvatarCharacterProps) {
  const hair = styleKeyFor(equipped, "hair");
  const top = styleKeyFor(equipped, "top");
  const bottom = styleKeyFor(equipped, "bottom");
  const shoes = styleKeyFor(equipped, "shoes");

  return (
    <div
      className={`relative inline-block ${sizeClass[size]} ${className}`}
      aria-label="꾸민 캐릭터"
      role="img"
    >
      <svg viewBox="0 0 120 180" className="h-full w-full overflow-visible" aria-hidden="true">
        {power === "flying" && (
          <g fill="#fff" stroke="#bdd5e8" strokeWidth="3">
            <path d="M28 82 C5 66 1 90 18 108 C8 106 4 113 13 124 C25 124 36 111 39 95 Z" />
            <path d="M92 82 C115 66 119 90 102 108 C112 106 116 113 107 124 C95 124 84 111 81 95 Z" />
          </g>
        )}
        {power === "invincible" && (
          <g fill="#ffd85d">
            <path d="M16 29 l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" />
            <circle cx="104" cy="82" r="6" />
          </g>
        )}

        <ellipse cx="60" cy="169" rx="35" ry="7" fill="rgba(55,45,40,.14)" />

        <g stroke="#3c3130" strokeWidth="3" strokeLinejoin="round">
          <path d="M42 119 L43 151 Q43 158 51 158 L57 158 L58 119 Z" fill={bottomColor(bottom)} />
          <path d="M62 119 L62 158 L70 158 Q78 158 78 151 L78 119 Z" fill={bottomColor(bottom)} />
          {bottom === "bottom-sport" && (
            <>
              <path d="M49 122 L49 152" stroke="#f0f1f4" strokeWidth="2" />
              <path d="M71 122 L71 152" stroke="#f0f1f4" strokeWidth="2" />
            </>
          )}
          {bottom === "bottom-gold" && <path d="M43 133 H78" stroke="#fff2a5" strokeWidth="4" />}

          <path d="M38 151 Q47 148 58 155 L57 166 Q43 168 34 162 Z" fill={shoeColor(shoes)} />
          <path d="M62 155 Q74 148 83 152 L86 163 Q76 168 62 166 Z" fill={shoeColor(shoes)} />
          {shoes === "shoes-boots" && (
            <>
              <path d="M39 147 H56" stroke="#513726" strokeWidth="5" />
              <path d="M64 147 H80" stroke="#513726" strokeWidth="5" />
            </>
          )}
          {shoes === "shoes-rocket" && (
            <>
              <path d="M39 165 l-6 9 10-4" fill="#f28b42" stroke="#f28b42" />
              <path d="M80 165 l7 9-11-4" fill="#f28b42" stroke="#f28b42" />
            </>
          )}

          {top === "top-hero" && <path d="M35 79 Q22 106 30 132 L49 116 Z" fill="#ef4d56" />}
          <path d="M35 77 Q60 66 85 77 L82 121 Q60 131 38 121 Z" fill={topColor(top)} />
          <path d="M35 82 Q24 91 28 112" fill="none" />
          <path d="M85 82 Q96 91 92 112" fill="none" />
          {top === "top-hoodie" && <path d="M42 78 Q60 62 78 78 Q75 91 60 91 Q45 91 42 78 Z" fill="#39465d" />}
          {top === "top-sport" && <path d="M59 78 V120" stroke="#fff" strokeWidth="5" />}
          {top === "top-rainbow" && (
            <>
              <path d="M40 88 H82" stroke="#f3cf5d" strokeWidth="5" />
              <path d="M39 99 H83" stroke="#69b8a6" strokeWidth="5" />
              <path d="M39 110 H83" stroke="#f07883" strokeWidth="5" />
            </>
          )}
          {top === "top-hero" && <path d="M60 84 l8 14-8 13-8-13z" fill="#ffd65e" stroke="#ffd65e" />}

          <circle cx="60" cy="55" r="29" fill="#f4c8a6" />
          <circle cx="50" cy="56" r="2.5" fill="#3c3130" stroke="none" />
          <circle cx="70" cy="56" r="2.5" fill="#3c3130" stroke="none" />
          <path d="M52 68 Q60 73 68 68" fill="none" strokeLinecap="round" />

          <path d="M34 50 Q34 20 60 20 Q87 20 87 49 Q74 34 58 36 Q44 37 34 50 Z" fill={hairColor(hair)} />
          {hair === "hair-swoop" && <path d="M37 37 Q57 16 82 30 Q70 39 52 39 Z" fill="#8a5730" stroke="none" />}
          {hair === "hair-spike" && <path d="M37 34 l9-19 8 14 8-21 8 20 14-11-4 25 Z" fill="#3b2b28" />}
          {hair === "hair-blue" && <path d="M36 39 Q47 14 60 25 Q72 8 85 37 Q69 31 57 38 Z" fill="#3158c9" stroke="none" />}
          {hair === "hair-star" && <path d="M60 11 l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="#f4d85c" stroke="#7f65c7" />}
          {hair === "hair-crown" && <path d="M42 25 l7-15 11 11 11-11 7 15-5 12H47z" fill="#f4cc43" stroke="#c58e21" />}
        </g>
      </svg>
    </div>
  );
}
