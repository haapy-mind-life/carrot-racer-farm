import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game-state";
import {
  MAP,
  SPAWN,
  PORTALS,
  cameraAt,
  nearestPortal,
  stepPlayer,
  type MiniKind,
  type Point,
} from "@/game/adventure";
import { Mascot } from "./Art";
import { Shell } from "./Shell";
import { MiniGame } from "./MiniGame";
import { useMovement } from "./useMovement";
import { MovePad } from "./MovePad";
import "./adventure.css";
let returnPosition: Point = { ...SPAWN };
const trees = Array.from({ length: 75 }, (_, i) => ({
  x: 80 + ((i * 379) % 2640),
  y: 80 + ((i * 587) % 1640),
})).filter(
  (p) =>
    Math.abs(p.y - 850) > 130 &&
    Math.abs(p.x - 1350) > 130 &&
    !PORTALS.some((g) => Math.hypot(g.x - p.x, g.y - p.y) < 180),
);
function Cottage({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="120" cy="180" rx="145" ry="25" fill="#46614d15" />
      <rect
        x="12"
        y="30"
        width="216"
        height="150"
        rx="18"
        fill="#fff6dc"
        stroke="#e6d4b5"
        strokeWidth="6"
      />
      <path d="M-10 55 120-28 250 55Z" fill={color} />
      <path
        d="M-10 55 120-28 250 55"
        fill="none"
        stroke="#ffffff80"
        strokeWidth="9"
        strokeLinejoin="round"
      />
      <rect x="98" y="96" width="45" height="84" rx="20" fill="#a48770" />
      <circle cx="132" cy="145" r="4" fill="#f3d98a" />
      {[37, 166].map((xx) => (
        <g key={xx}>
          <rect
            x={xx}
            y="85"
            width="40"
            height="43"
            rx="10"
            fill="#bddde0"
            stroke="white"
            strokeWidth="5"
          />
          <path d={`M${xx + 20} 86v42M${xx} 107h40`} stroke="white" strokeWidth="4" />
        </g>
      ))}
      <text x="120" y="76" textAnchor="middle" fontSize="15" fill="#665847">
        {label}
      </text>
    </g>
  );
}
export function Village() {
  const { state, dispatch, ready } = useGame();
  const nav = useNavigate();
  const [pos, setPos] = useState<Point>(() => ({ ...returnPosition }));
  const [size, setSize] = useState({ w: 960, h: 600 });
  const [mini, setMini] = useState<MiniKind | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [message, setMessage] = useState("현준아, 오늘은 어디로 가볼까? 길을 따라 걸어가 봐!");
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const nearby = nearestPortal(pos);
  const interact = () => {
    if (!ready || mini) return;
    if (nearby) {
      returnPosition = { ...pos };
      if ("game" in nearby) setMini(nearby.game);
      else void nav({ to: nearby.target });
    } else if (Math.hypot(pos.x - 1420, pos.y - 1030) < 100) {
      dispatch({ type: "feed-animal", id: "bori" });
      setMessage("보리: 멍멍! 같이 놀아줘서 고마워!");
    }
  };
  const movement = useMovement(!mini, interact);
  const direction = useRef(movement.direction);
  direction.current = movement.direction;
  useEffect(() => {
    if (!viewport.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (mini) return;
    let raf = 0,
      last = 0;
    const loop = (now: number) => {
      const d = direction.current();
      const moving = Boolean(d.x || d.y);
      setWalking(moving);
      if (d.x) setFacing(d.x > 0 ? 1 : -1);
      const dt = last ? (now - last) / 1000 : 0;
      if (moving)
        setPos((p) => {
          const next = stepPlayer(p, d, dt);
          returnPosition = next;
          return next;
        });
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mini]);
  const camera = cameraAt(pos, size.w, size.h);
  return (
    <Shell
      active="home"
      title="현준이의 모험 마을"
      subtitle="걸어서 만나는 친구들, 골목마다 새로운 놀이"
    >
      <div className="adv-toolbar">
        <span>✦ 오늘의 모험은 네 마음대로</span>
        <button onClick={() => setMapOpen((v) => !v)} aria-expanded={mapOpen}>
          지도 {mapOpen ? "접기" : "보기"}
        </button>
      </div>
      <div
        className="adv-viewport"
        ref={viewport}
        aria-label="방향키 또는 WASD로 이동하는 모험 월드"
        tabIndex={0}
      >
        <div
          className="adv-map"
          style={{
            width: MAP.width,
            height: MAP.height,
            transform: `translate(${-camera.x}px,${-camera.y}px)`,
          }}
        >
          <svg
            className="adv-terrain"
            viewBox={`0 0 ${MAP.width} ${MAP.height}`}
            aria-hidden="true"
          >
            <defs>
              <pattern id="grass" width="95" height="83" patternUnits="userSpaceOnUse">
                <rect width="95" height="83" fill="#d7e7b9" />
                <path
                  d="m20 30 3-6 3 6m44 37 3-5 3 5"
                  fill="none"
                  stroke="#bace9c"
                  strokeWidth="2"
                />
                <circle cx="75" cy="22" r="2" fill="#f9f6d9" />
              </pattern>
            </defs>
            <rect width="2800" height="1800" fill="url(#grass)" />
            <ellipse cx="530" cy="1270" rx="350" ry="290" fill="#c5dca9" />
            <ellipse cx="1270" cy="360" rx="400" ry="230" fill="#c7dfc2" />
            <path
              d="M90 850H1600V620H2550V1100H2030M2550 850H2700M1350 120V1680M480 850V540M2380 620V520M550 850V1320M1250 850V390M2225 1100V1450"
              fill="none"
              stroke="#ecdbb8"
              strokeWidth="110"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M90 850H1600V620H2550V1100H2030M2550 850H2700M1350 120V1680"
              fill="none"
              stroke="#f5e7ca"
              strokeWidth="78"
              strokeLinecap="round"
            />
            <circle cx="1350" cy="850" r="155" fill="#f5e7ca" />
            <circle cx="1350" cy="815" r="68" fill="#e6d6be" />
            <circle cx="1350" cy="808" r="55" fill="#a7d6dc" />
            <circle cx="1350" cy="802" r="33" fill="#c8edf0" />
            <path
              d="M1350 802v-43m-14 20q14-25 28 0"
              fill="none"
              stroke="#fafff4"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <rect
              x="1740"
              y="710"
              width="650"
              height="310"
              rx="100"
              fill="#92cdd5"
              stroke="#bcdbb3"
              strokeWidth="22"
            />
            <path
              d="M1800 810q60-20 120 0m180 100q65-20 130 0m-340 20q45-10 90 0"
              stroke="#d3edf0"
              strokeWidth="5"
              fill="none"
            />
            <rect x="1985" y="970" width="100" height="98" rx="8" fill="#c49d79" />
            {[986, 1006, 1026, 1046].map((y) => (
              <path key={y} d={`M1985 ${y}h100`} stroke="#a78165" strokeWidth="3" />
            ))}
            <Cottage x={360} y={330} color="#df9e91" label="HOME" />
            <Cottage x={2100} y={1170} color="#92b8a0" label="FARM" />
            <g transform="translate(2260 300)">
              <rect x="5" y="15" width="30" height="155" rx="10" fill="#f2bd70" />
              <rect x="205" y="15" width="30" height="155" rx="10" fill="#f2bd70" />
              <rect
                y="0"
                width="240"
                height="70"
                rx="20"
                fill="#fdf6dc"
                stroke="#edbf7f"
                strokeWidth="6"
              />
              <text x="120" y="44" textAnchor="middle" fill="#73664e" fontSize="24">
                PARK RUNNER
              </text>
              <path d="M35 90h170" stroke="#fffdf2" strokeWidth="18" strokeDasharray="18 18" />
              <path
                d="M35 90h170"
                stroke="#879a8c"
                strokeWidth="18"
                strokeDasharray="18 18"
                strokeDashoffset="18"
              />
            </g>
            {trees.map((t, i) => (
              <g key={i} transform={`translate(${t.x} ${t.y})`}>
                <ellipse cy="35" rx="35" ry="12" fill="#597b4120" />
                <rect x="-7" y="0" width="14" height="40" rx="5" fill="#b79c79" />
                <circle cy="-10" r="39" fill={i % 2 ? "#9abf8e" : "#a8c790"} />
                <circle cx="-20" r="27" fill="#b8d29c" />
                <circle cx="22" cy="-3" r="25" fill="#a2c189" />
                {i % 3 === 0 && <circle cx="16" cy="-20" r="6" fill="#efd69b" />}
              </g>
            ))}
            <text x="550" y="1120" textAnchor="middle" fontSize="32" fill="#688756">
              토토의 보물 숲
            </text>
            <text x="1250" y="240" textAnchor="middle" fontSize="32" fill="#668a72">
              별빛 미니 파크
            </text>
            <text x="2065" y="820" textAnchor="middle" fontSize="28" fill="#4f93a1">
              반짝 호수
            </text>
            <g transform="translate(1110 280)">
              <path
                d="M0 70 25 0h80l25 70M25 0v55m80-55v55"
                stroke="#be9b7e"
                strokeWidth="8"
                fill="none"
              />
              <path d="M30 57h28m18 0h28" stroke="#e5a995" strokeWidth="9" />
            </g>
            <g transform="translate(500 1180)">
              <rect width="90" height="65" rx="12" fill="#c9a072" />
              <path d="M0 25h90M45 0v65" stroke="#f9df9b" strokeWidth="8" />
              <circle cx="45" cy="32" r="10" fill="#f4cf74" />
            </g>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${2120 + i * 76} 1470)`}>
                <rect width="55" height="100" rx="15" fill="#c0a17b" />
                {[20, 50, 80].map((y) => (
                  <path
                    key={y}
                    d={`M28 ${y + 10}v-15m0 8q-20 0-15-10 15 0 15 10 0-10 15-10 5 10-15 10`}
                    stroke="#8db685"
                    strokeWidth="5"
                    fill="#a9c58e"
                  />
                ))}
              </g>
            ))}
          </svg>
          {PORTALS.map((g) => (
            <div
              className={`adv-gate ${nearby?.id === g.id ? "near" : ""}`}
              key={g.id}
              style={{ left: g.x, top: g.y }}
            >
              <span>
                {g.id === "runner"
                  ? "달리기"
                  : g.id === "house"
                    ? "꾸미기"
                    : g.id === "farm"
                      ? "키우기"
                      : "놀기"}
              </span>
              <b>{g.name}</b>
              <i />
            </div>
          ))}
          <div className="adv-friend" style={{ left: 600, top: 1300 }}>
            <Mascot outfit="peach" small />
            <b>토토</b>
          </div>
          <div className="adv-friend" style={{ left: 1320, top: 400 }}>
            <Mascot outfit="lavender" small />
            <b>루루</b>
          </div>
          <div className="adv-dog" style={{ left: 1420, top: 1030 }}>
            <span>🐶</span>
            <b>보리</b>
          </div>
          <div
            className={`adv-player ${walking ? "walking" : ""}`}
            style={{ left: pos.x, top: pos.y }}
          >
            <div style={{ transform: `scaleX(${facing})` }}>
              <Mascot outfit={state.outfit} small />
            </div>
            <b>현준</b>
          </div>
        </div>
        <div className="adv-location">{nearby?.name ?? "초록빛 모험 마을"}</div>
        {mapOpen && (
          <div className="adv-minimap">
            <svg viewBox="0 0 2800 1800" aria-label="월드 지도">
              <rect width="2800" height="1800" rx="100" fill="#d7e7b9" />
              <path
                d="M90 850H1600V620H2550V1100H2030M2550 850H2700M1350 120V1680"
                stroke="#f7edd9"
                strokeWidth="100"
              />
              {PORTALS.map((g) => (
                <g key={g.id}>
                  <circle cx={g.x} cy={g.y} r="60" fill="#b498c7" />
                  <text x={g.x} y={g.y - 90} textAnchor="middle" fontSize="115" fill="#354e43">
                    {g.name}
                  </text>
                </g>
              ))}
              <circle cx={pos.x} cy={pos.y} r="65" fill="#e5796c" stroke="white" strokeWidth="20" />
            </svg>
            <small>분홍 점이 현준이야</small>
          </div>
        )}
        <div className="adv-bottom">
          <MovePad hold={movement.hold} />
          <button
            className="adv-interact"
            onClick={interact}
            disabled={!ready || (!nearby && Math.hypot(pos.x - 1420, pos.y - 1030) >= 100)}
          >
            {nearby
              ? `E · ${nearby.name}`
              : Math.hypot(pos.x - 1420, pos.y - 1030) < 100
                ? "E · 보리 돌보기"
                : "친구나 입구로 걸어가 봐"}
          </button>
        </div>
      </div>
      <div className="adv-footer">
        <p role="status">{message}</p>
        <span>WASD / 방향키 이동 · E 놀이 · 지도에서 위치 확인</span>
      </div>
      {mini && (
        <MiniGame
          kind={mini}
          onClose={() => {
            setMini(null);
            setMessage("잘 놀았어! 이번에는 다른 곳도 가볼까?");
            viewport.current?.focus();
          }}
        />
      )}
    </Shell>
  );
}
