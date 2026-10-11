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
import { FriendArt } from "./FriendArt";
import { Garage, loadCarId, saveCarId } from "./Garage";
import { CarArt } from "./CarArt";
import { carById, CARS } from "@/game/cars";
import { WorldScenes } from "./WorldScenes";
import { LifeWorldScene } from "./LifeWorldScene";
import { UnifiedCoast, GrowingHome } from "./UnifiedCoast";
import {
  COAST,
  OCEAN,
  HOUSE_TIERS,
  OCEAN_DISCOVERIES,
  nearWorld,
  stepSubmarine,
} from "@/game/unified-world";
import {
  FOOD_MENU,
  LIFE_MAPS,
  LIFE_SPOTS,
  LIFE_REGION_LABELS,
  nearbyTreasure,
  nextFoodOrder,
  freshFoodOrderId,
  stepLifePlayer,
  type LifeRegion,
  type FoodId,
  type FoodOrder,
} from "@/game/life-world";
import { playGameSiren } from "@/game/siren";
import {
  WORLD_CALLS,
  STATIONS,
  CAMP,
  distance,
  canHelp,
  helpProgress,
  nextCallIndex,
  routeDirection,
  isNearLake,
  enterLake,
  diveStep,
  leaveLake,
  isNearCamp,
  thiefPosition,
} from "@/game/world-events";
import { Shell } from "./Shell";
import { MiniGame } from "./MiniGame";
import { useMovement } from "./useMovement";
import { Joystick } from "./Joystick";
import { VILLAGES } from "@/game/villages";
import { Constellation } from "./Constellation";
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
  const [drawing, setDrawing] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [message, setMessage] = useState("현준아, 오늘은 어디로 가볼까? 길을 따라 걸어가 봐!");
  const [walking, setWalking] = useState(false);
  const [region, setRegion] = useState<LifeRegion>("village");
  const [lifePos, setLifePos] = useState<Point>({ ...LIFE_SPOTS.mansionInside });
  const [holding, setHolding] = useState<FoodId | null>(null);
  const [robotFollowing, setRobotFollowing] = useState(false);
  const [submarine, setSubmarine] = useState(false);
  const [submerged, setSubmerged] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);
  const [order, setOrder] = useState<FoodOrder>(() => nextFoodOrder(0, freshFoodOrderId()));
  const [truckOpen, setTruckOpen] = useState(false);
  const saleBusy = useRef(false);
  const nearLife = (point: Point, range = 180) => nearWorld(pos, point, range);
  const atOriginalHouse = nearWorld(pos, { x: 480, y: 565 }, 185);
  const goHomeInside = () => {
    setRegion("mansion");
    setLifePos({ ...LIFE_SPOTS.mansionInside });
    setDriving(false);
    setSubmarine(false);
    setMessage("현준이 집 안으로 들어왔어! 부엌에서 음식을 집고 식탁에서 먹어 봐.");
  };
  const backToWorld = () => {
    setRegion("village");
    setPos({ x: 480, y: 610 });
    returnPosition = { x: 480, y: 610 };
    setMessage("내가 키운 집 앞으로 돌아왔어!");
  };
  const sellPreparedFood = () => {
    if (
      saleBusy.current ||
      order.phase !== "prepared" ||
      holding !== order.foodId ||
      !nearLife(COAST.customer, 225)
    )
      return;
    saleBusy.current = true;
    dispatch({ type: "sell-food", id: order.id, foodId: order.foodId });
    setHolding(null);
    const next = orderIndex + 1;
    setOrderIndex(next);
    setOrder(nextFoodOrder(next, freshFoodOrderId()));
    setMessage("손님에게 음식을 전달했어! 별코인을 벌었어!");
    window.setTimeout(() => {
      saleBusy.current = false;
    }, 300);
  };
  const upgradeHome = () => {
    const next = HOUSE_TIERS[state.houseTier];
    if (!next) {
      setMessage("우리 집이 최고의 성으로 완성됐어!");
      return;
    }
    if (state.money < next.cost) {
      setMessage("집을 키우려면 " + next.cost + " 별코인이 필요해. 푸드트럭 장사를 해보자!");
      return;
    }
    dispatch({ type: "upgrade-house" });
    setMessage("축하해! 우리 집이 " + next.name + "으로 커졌어!");
  };
  const actionLife = () => {
    if (region === "mansion") {
      if (nearWorld(lifePos, LIFE_SPOTS.mansionExit, 260)) {
        backToWorld();
        return;
      }
      if (nearWorld(lifePos, LIFE_SPOTS.mansionKitchen, 300)) {
        setHolding("pizza");
        setMessage("피자를 손에 들었어! 식탁에서 먹어 보자.");
        return;
      }
      if (nearWorld(lifePos, LIFE_SPOTS.mansionDining, 310) && holding) {
        setHolding(null);
        setMessage("냠냠! 맛있게 먹었어!");
        return;
      }
      setMessage("부엌이나 식탁으로 직접 걸어가 봐!");
      return;
    }
    if (submarine) {
      if (nearLife(COAST.harbor, 220)) {
        setSubmarine(false);
        setSubmerged(false);
        setPos({ x: COAST.harbor.x - 150, y: COAST.harbor.y + 40 });
        setMessage("항구에 돌아왔어!");
        return;
      }
      const found = OCEAN_DISCOVERIES.find((site) => nearLife(site, 190));
      if (found) {
        dispatch({ type: "explore-sea", id: found.id });
        setMessage(found.name + " 발견! 바닷속 탐험 성공!");
        return;
      }
      setSubmerged((v) => !v);
      setMessage(submerged ? "잠수함이 수면으로 올라왔어." : "잠수함이 바닷속 깊이 잠수했어!");
      return;
    }
    if (atOriginalHouse) {
      goHomeInside();
      return;
    }
    if (nearLife(COAST.customer, 225) && order.phase === "prepared") {
      sellPreparedFood();
      return;
    }
    if (nearLife(COAST.truck, 275)) {
      setTruckOpen(true);
      setMessage("손님이 주문한 메뉴를 준비하자!");
      return;
    }
    if (nearLife(COAST.harbor, 290)) {
      setDriving(false);
      setSubmarine(true);
      setSubmerged(false);
      setPos({ x: OCEAN.start + 65, y: COAST.harbor.y });
      setMessage("잠수함 탑승! 오른쪽 버튼으로 잠수하고 조이스틱으로 탐험하자.");
      return;
    }
    if (nearLife(COAST.robot, 240)) {
      setRobotFollowing((v) => !v);
      setMessage(robotFollowing ? "로봇이 여기서 쉬고 있어." : "아빠 로봇이 함께 따라다녀!");
      return;
    }
    setMessage("집·푸드트럭·항구에 가까이 가서 행동을 눌러 봐.");
  };
  const actionLifeLabel = () => {
    if (region === "mansion") {
      if (nearWorld(lifePos, LIFE_SPOTS.mansionExit, 260)) return "집 밖으로";
      if (nearWorld(lifePos, LIFE_SPOTS.mansionKitchen, 300)) return "음식 집기";
      if (nearWorld(lifePos, LIFE_SPOTS.mansionDining, 310) && holding) return "음식 먹기";
      return "집 탐험";
    }
    if (submarine) {
      if (nearLife(COAST.harbor, 220)) return "잠수함 하차";
      if (OCEAN_DISCOVERIES.some((site) => nearLife(site, 190))) return "바다 보물 발견";
      return submerged ? "수면으로 상승" : "바닷속 잠수";
    }
    if (atOriginalHouse) return "우리 집 들어가기";
    if (nearLife(COAST.customer, 225) && order.phase === "prepared") return "음식 전달";
    if (nearLife(COAST.truck, 275)) return "푸드트럭 영업";
    if (nearLife(COAST.harbor, 290)) return "잠수함 타기";
    if (nearLife(COAST.robot, 240)) return "아빠 로봇 동행";
    return "주변 살펴보기";
  };
  const [garageOpen, setGarageOpen] = useState(false);
  const [carId, setCarId] = useState(loadCarId);
  const [driving, setDriving] = useState(false);
  const [callIndex, setCallIndex] = useState(-1);
  const [callPhase, setCallPhase] = useState<"idle" | "reported" | "dispatched" | "resolved">(
    "idle",
  );
  const [helpCount, setHelpCount] = useState(0);
  const [siren, setSiren] = useState(false);
  const [diving, setDiving] = useState(false);
  const [camping, setCamping] = useState(false);
  const [thiefStep, setThiefStep] = useState(0);
  const call = callIndex < 0 ? null : WORLD_CALLS[callIndex]!;
  const target =
    call?.kind === "police" && callPhase === "dispatched" ? thiefPosition(thiefStep) : call;
  const nearTarget = Boolean(target && distance(pos, target) <= 145);
  const emergencyVehicle = call ? CARS.find((car) => car.kind === call.kind) : undefined;
  const reportCall = () => {
    const index = nextCallIndex(callIndex);
    setCallIndex(index);
    setCallPhase("reported");
    setHelpCount(0);
    setSiren(false);
    setThiefStep(0);
    setMessage(WORLD_CALLS[index]!.report);
  };
  const dispatchCall = () => {
    if (!call || !emergencyVehicle) return;
    const start = STATIONS[call.kind];
    setDriving(true);
    setDiving(false);
    setCamping(false);
    setPos({ x: start.x, y: start.y });
    returnPosition = { x: start.x, y: start.y };
    setCarId(emergencyVehicle.id);
    saveCarId(emergencyVehicle.id);
    setCallPhase("dispatched");
    setSiren(true);
    playGameSiren();
    setMapOpen(false);
    setMessage(call.title + " 사이렌 출동! 파란 길을 따라가자.");
  };
  const helpCall = () => {
    if (!call || callPhase !== "dispatched") return;
    const car = carById(carId);
    if (
      !canHelp(call, pos, car.kind, driving) &&
      !(call.kind === "police" && driving && car.kind === "police" && nearTarget)
    ) {
      setMessage("사건 장소까지 파란 길을 따라가고, 알맞은 출동 차량을 타야 해!");
      return;
    }
    const next = helpProgress(call, helpCount);
    setHelpCount(next);
    if (next < call.needed) {
      setMessage(
        "소방차 물줄기 발사! 불꽃이 " +
          (call.needed - next) +
          "개 남았어. 물 뿌리기를 다시 누르자!",
      );
    } else {
      setCallPhase("resolved");
      setSiren(false);
      setMessage(
        call.kind === "fire"
          ? "불을 모두 껐어! 사람들도 안전하게 대피했어."
          : call.kind === "police"
            ? "도둑을 붙잡았어! 시장이 다시 평화로워졌어."
            : "도움이 필요한 사람을 구조대가 안전하게 도왔어! 잘했어.",
      );
    }
  };
  const [facing, setFacing] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);
  const nearby = nearestPortal(pos);
  const friend = VILLAGES.find((v) => Math.hypot(v.x - pos.x, v.y - pos.y) < 105);
  const district = [...VILLAGES].sort(
    (a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y),
  )[0];
  const nearDrawing = Math.hypot(pos.x - 5010, pos.y - 520) < 110;
  const interact = () => {
    if (!ready || mini || drawing || garageOpen) return;
    if (region === "mansion") {
      actionLife();
      return;
    }
    if (submarine || atOriginalHouse || pos.x > 5700) {
      actionLife();
      return;
    }

    if (call && callPhase === "dispatched" && nearTarget) {
      helpCall();
      return;
    }
    if (diving) {
      const shore = leaveLake(pos);
      setPos(shore);
      returnPosition = shore;
      setDiving(false);
      setMessage("물속 탐험을 마치고 안전하게 호숫가로 나왔어!");
      return;
    }
    if (isNearCamp(pos) && !driving) {
      setCamping((v) => !v);
      setMessage(
        camping ? "캠핑을 정리했어. 다음에는 어디로 갈까?" : "텐트를 치고 캠핑을 시작했어!",
      );
      return;
    }
    if (isNearLake(pos) && !driving) {
      const lakePos = enterLake(pos);
      setPos(lakePos);
      returnPosition = lakePos;
      setDiving(true);
      setMessage("잠수 시작! 조이스틱으로 호수 속을 헤엄쳐 보자.");
      return;
    }
    if (nearDrawing) {
      setDrawing(true);
      return;
    }
    if (friend) {
      setMessage(`${friend.friend}: ${friend.words}`);
      return;
    }
    if (nearby) {
      returnPosition = { ...pos };
      if ("game" in nearby) setMini(nearby.game);
      else void nav({ to: nearby.target });
    } else if (Math.hypot(pos.x - 1420, pos.y - 1030) < 100) {
      dispatch({ type: "feed-animal", id: "bori" });
      setMessage("보리: 멍멍! 같이 놀아줘서 고마워!");
    } else {
      setMessage(
        "왼쪽 조이스틱을 밀어 친구나 놀이 입구로 가 봐! 오른쪽 지도 버튼으로 마을 여행도 할 수 있어.",
      );
    }
  };
  useEffect(() => {
    // Incidents appear in the same world without requiring a separate mini-game.
    const timeout = window.setTimeout(() => {
      setCallIndex((current) => {
        if (current < 0) {
          setCallPhase("reported");
          setMessage(WORLD_CALLS[0]!.report);
          return 0;
        }
        return current;
      });
    }, 12000);
    return () => window.clearTimeout(timeout);
  }, []);
  const movement = useMovement(
    !mini && !drawing && !mapOpen && !garageOpen && !truckOpen,
    interact,
  );
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
    if (mini || drawing || mapOpen || garageOpen || truckOpen) return;
    let raf = 0,
      last = 0;
    const loop = (now: number) => {
      const d = direction.current();
      const moving = Boolean(d.x || d.y);
      setWalking(moving);
      if (d.x) setFacing(d.x > 0 ? 1 : -1);
      const dt = last ? (now - last) / 1000 : 0;
      if (moving && region === "mansion") setLifePos((p) => stepLifePlayer("mansion", p, d, dt));
      if (moving && region === "village")
        setPos((p) => {
          const next = submarine
            ? stepSubmarine(p, d, dt)
            : diving
              ? diveStep(p, d, dt)
              : stepPlayer(p, d, dt * (driving ? 1.48 : 1));
          returnPosition = next;
          return next;
        });
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mini, drawing, mapOpen, garageOpen, truckOpen, diving, driving, region, submarine]);
  const camera =
    region === "village"
      ? cameraAt(pos, size.w, size.h)
      : {
          x: Math.max(0, Math.min(LIFE_MAPS[region].width - size.w, lifePos.x - size.w / 2)),
          y: Math.max(0, Math.min(LIFE_MAPS[region].height - size.h, lifePos.y - size.h / 2)),
        };
  return (
    <Shell
      active="home"
      title="현준이의 둥근 마을 여행"
      subtitle="열 개 마을을 한 바퀴! 왼쪽 조이스틱을 밀어 출발해요."
    >
      <div className="adv-toolbar">
        <span>✦ 오늘의 모험은 네 마음대로 · {state.money} 별코인</span>
        <button
          onClick={() =>
            region === "village"
              ? (setPos({ x: 6180, y: 940 }),
                setMessage("해안 마을로 왔어! 왼쪽으로 걸어가면 원래 마을이 이어져 있어."))
              : backToWorld()
          }
        >
          🌊 {region === "village" ? "해변 안내" : "집 밖으로"}
        </button>
        <button onClick={() => setGarageOpen(true)}>🚗 자동차 120대</button>
        {region === "village" && (
          <span>🏠 우리 집 Lv.{state.houseTier}/4 · 🌊 해안과 바다도 하나의 월드</span>
        )}
        <button onClick={() => setMapOpen((v) => !v)} aria-expanded={mapOpen}>
          지도 {mapOpen ? "접기" : "보기"}
        </button>
      </div>
      <div
        className="adv-viewport"
        ref={viewport}
        aria-label="왼쪽 조이스틱으로 이동하는 열 개 마을"
        tabIndex={0}
      >
        <div
          className="adv-map"
          style={{
            width: region === "village" ? MAP.width : LIFE_MAPS[region].width,
            height: region === "village" ? MAP.height : LIFE_MAPS[region].height,
            transform: `translate(${-camera.x}px,${-camera.y}px)`,
          }}
        >
          {region === "village" ? (
            <>
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
                <rect width={MAP.width} height={MAP.height} fill="url(#grass)" />
                <path
                  d="M2700 850H5600M0 850H90M3200 400V1500M4000 400V1500M5000 400V1500M3200 500H5100M3200 1350H5100"
                  stroke="#f5e7ca"
                  strokeWidth="100"
                  fill="none"
                />
                {VILLAGES.filter((v) => v.x > 2800).map((v) => (
                  <g key={v.id}>
                    <ellipse
                      cx={v.x}
                      cy={v.y - 90}
                      rx="245"
                      ry="155"
                      fill={v.color}
                      opacity="0.7"
                    />
                    <text x={v.x} y={v.y - 235} textAnchor="middle" fontSize="30" fill="#40564d">
                      {v.name}
                    </text>
                    {Array.from({ length: 12 }, (_, i) => (
                      <g
                        key={i}
                        transform={`translate(${v.x - 230 + (i % 6) * 90} ${v.y - 170 + Math.floor(i / 6) * 90})`}
                      >
                        {v.id === "apple" || v.id === "pineapple" ? (
                          <>
                            <rect x="-5" y="5" width="10" height="40" rx="4" fill="#b48f69" />
                            <circle cy="-5" r="26" fill="#8cb589" />
                            <circle
                              cx="10"
                              cy="-4"
                              r="10"
                              fill={v.id === "apple" ? "#e48a7c" : "#f1cf66"}
                            />
                          </>
                        ) : (
                          <path
                            d="M0-22 18 0 0 24-18 0Z"
                            fill={
                              v.id === "diamond"
                                ? "#89bfe2"
                                : v.id === "emerald"
                                  ? "#58aa8d"
                                  : "#78b8c0"
                            }
                            stroke="white"
                            strokeWidth="3"
                          />
                        )}
                      </g>
                    ))}
                  </g>
                ))}
                <text x="5010" y="370" textAnchor="middle" fontSize="30" fill="#6c6395">
                  별자리 공방
                </text>
                <circle cx="5010" cy="430" r="48" fill="#b7abd8" />
                <text x="5010" y="448" textAnchor="middle" fontSize="50" fill="#fff2c1">
                  ★
                </text>
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
                <g transform="translate(245 155)">
                  <GrowingHome tier={state.houseTier} />
                </g>
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
              <UnifiedCoast
                houseTier={state.houseTier}
                submarine={submarine}
                submerged={submerged}
                discovered={state.visitedSeaTreasures}
                robotFollowing={robotFollowing}
              />
              <WorldScenes
                player={pos}
                call={call}
                phase={callPhase}
                progress={helpCount}
                thiefStep={thiefStep}
                siren={siren}
                diving={diving}
                camping={camping}
              />
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
              {VILLAGES.map((v, friendIndex) => (
                <button
                  key={v.id}
                  className="adv-friend adv-npc"
                  style={{ left: v.x, top: v.y }}
                  onClick={() =>
                    setMessage(
                      `${v.friend}: ${Math.hypot(v.x - pos.x, v.y - pos.y) < 105 ? v.words : "가까이 와서 이야기하자! 왼쪽 조이스틱을 밀어 봐."}`,
                    )
                  }
                  aria-label={`${v.friend} · 이야기`}
                >
                  <FriendArt index={friendIndex} />
                  <b>{v.friend}</b>
                  <small>{v.name}</small>
                </button>
              ))}
              <div
                className={`adv-gate ${nearDrawing ? "near" : ""}`}
                style={{ left: 5010, top: 520 }}
              >
                <span>손가락 · 펜 놀이</span>
                <b>별자리 공방</b>
                <i />
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
                  {submarine ? (
                    <svg
                      className="hj-submarine-player"
                      width="176"
                      height="110"
                      viewBox="0 0 176 110"
                      role="img"
                      aria-label="노란 잠수함"
                    >
                      <ellipse
                        cx="83"
                        cy="76"
                        rx="74"
                        ry="29"
                        fill="#ffc956"
                        stroke="#f9f1cc"
                        strokeWidth="7"
                      />
                      <path
                        d="M71 51V19H124"
                        fill="none"
                        stroke="#ffd977"
                        strokeWidth="17"
                        strokeLinecap="round"
                      />
                      <rect x="74" y="18" width="32" height="33" rx="7" fill="#ffc956" />
                      <circle
                        cx="48"
                        cy="72"
                        r="17"
                        fill="#a3e8ec"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <circle
                        cx="90"
                        cy="72"
                        r="17"
                        fill="#a3e8ec"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <circle
                        cx="131"
                        cy="72"
                        r="17"
                        fill="#a3e8ec"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        d="M14 66L2 44V95L14 83"
                        fill="#ffdd72"
                        stroke="#f8f0d0"
                        strokeWidth="5"
                      />
                    </svg>
                  ) : diving ? (
                    <span className="hj-diver">🤿</span>
                  ) : driving ? (
                    <CarArt car={carById(carId)} size={98} />
                  ) : (
                    <Mascot outfit={state.outfit} small />
                  )}
                </div>
                <b>{submarine ? "현준 잠수함" : driving ? "현준 🚗" : "현준"}</b>
              </div>
            </>
          ) : (
            <LifeWorldScene
              region={region}
              player={lifePos}
              following={robotFollowing}
              holding={holding}
              submarine={submarine}
              explored={state.visitedSeaTreasures}
              houseTier={state.houseTier}
            />
          )}
        </div>
        {region === "village" && (
          <div className="hj-live-board" role="status">
            {atOriginalHouse && (
              <button onClick={upgradeHome} disabled={state.houseTier >= 4}>
                🏡{" "}
                {state.houseTier >= 4
                  ? "우리 집 최대 단계"
                  : "우리 집 확장 · " + HOUSE_TIERS[state.houseTier]!.cost + " 별코인"}
              </button>
            )}
            {submarine && (
              <button
                onClick={() => {
                  setSubmerged((v) => !v);
                  setMessage(
                    submerged ? "바닷속에서 수면으로 올라왔어." : "잠수함이 바닷속으로 내려갔어!",
                  );
                }}
              >
                🐠 {submerged ? "수면으로 올라가기" : "바닷속 잠항"}
              </button>
            )}
            <button onClick={reportCall}>
              ☎️{" "}
              {callPhase === "idle" || callPhase === "resolved" ? "새로운 신고 받기" : "다른 신고"}
            </button>
            {call && callPhase !== "resolved" && (
              <>
                <strong>{call.report}</strong>
                {callPhase === "reported" && (
                  <button onClick={dispatchCall}>🚨 {STATIONS[call.kind].label}에서 출동</button>
                )}
                {callPhase === "dispatched" && (
                  <>
                    <small>
                      목적지까지 {Math.round(target ? distance(pos, target) : 0)}m ·{" "}
                      {target ? routeDirection(pos, target) : ""}
                    </small>
                    <button
                      onClick={() => {
                        setSiren((v) => !v);
                        if (!siren) playGameSiren();
                        setMessage("사이렌을 " + (siren ? "껐어." : "켰어!"));
                      }}
                    >
                      {siren ? "🔕 사이렌 끄기" : "🚨 사이렌 켜기"}
                    </button>
                    {call.kind === "police" && (
                      <button onClick={() => setThiefStep((p) => p + 1)}>🏃 도둑 추적</button>
                    )}
                    {nearTarget && (
                      <button onClick={helpCall}>
                        {call.kind === "fire"
                          ? "💦 물 뿌리기"
                          : call.kind === "police"
                            ? "🚓 도둑 잡기"
                            : "🚑 사람 돕기"}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
            {callPhase === "resolved" && <strong>✅ 사건 해결! 새로운 신고를 받아 볼까?</strong>}
            {!driving && isNearLake(pos) && (
              <button
                onClick={() => {
                  const p = enterLake(pos);
                  setPos(p);
                  returnPosition = p;
                  setDiving(true);
                }}
              >
                🤿 호수 잠수
              </button>
            )}
            {diving && (
              <button
                onClick={() => {
                  const p = leaveLake(pos);
                  setPos(p);
                  returnPosition = p;
                  setDiving(false);
                }}
              >
                호숫가로 나오기
              </button>
            )}
            {!driving && isNearCamp(pos) && (
              <button
                onClick={() => {
                  setCamping((v) => !v);
                  setMessage("숲속 캠핑을 즐겨 보자!");
                }}
              >
                {camping ? "⛺ 캠핑 정리" : "⛺ 텐트 치기"}
              </button>
            )}
          </div>
        )}
        {region !== "village" && (
          <div className="hj-life-hud">
            <b>{LIFE_REGION_LABELS[region]}</b>
            <small>🏠 대왕집 · 🤖 아빠 로봇 · 🍕 푸드트럭 · 🌊 잠수함</small>
            <span>💰 {state.money} 별코인</span>
            {holding && (
              <span>손에 든 음식: {FOOD_MENU.find((food) => food.id === holding)?.name}</span>
            )}
          </div>
        )}
        <div className="adv-location">
          {region !== "village"
            ? LIFE_REGION_LABELS[region]
            : nearDrawing
              ? "별자리 공방"
              : (district?.name ?? "우리 마을")}
        </div>
        {mapOpen && region === "village" && (
          <div className="adv-globe" role="dialog" aria-label="둥근 세계 지도">
            <header>
              <b>우리 세계 한 바퀴</b>
              <button onClick={() => setMapOpen(false)}>닫기</button>
            </header>
            <svg viewBox="0 0 340 160" aria-hidden="true">
              <ellipse cx="170" cy="80" rx="155" ry="72" fill="#badde8" />
              <ellipse cx="170" cy="80" rx="100" ry="72" fill="none" stroke="#eff9fa" />
              <ellipse cx="170" cy="80" rx="155" ry="32" fill="none" stroke="#eff9fa" />
              {VILLAGES.map((v, i) => (
                <g key={v.id}>
                  <circle
                    cx={35 + (v.x / MAP.width) * 270}
                    cy={24 + (v.y / MAP.height) * 110}
                    r="14"
                    fill={v.color}
                  />
                  <text
                    x={35 + (v.x / MAP.width) * 270}
                    y={29 + (v.y / MAP.height) * 110}
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {i + 1}
                  </text>
                </g>
              ))}
              <circle
                cx={35 + (pos.x / MAP.width) * 270}
                cy={24 + (pos.y / MAP.height) * 110}
                r="5"
                fill="#cb5e64"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
            <small>동쪽과 서쪽이 이어져요 · 마을을 누르면 여행!</small>
            <div className="adv-destinations">
              {VILLAGES.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    const next = { x: v.x, y: v.y + 65 };
                    setPos(next);
                    returnPosition = next;
                    setMapOpen(false);
                    setMessage(`${v.name}에 도착했어! ${v.friend}에게 인사해 봐.`);
                  }}
                >
                  {i + 1}. {v.name}
                </button>
              ))}
            </div>
            <button
              className="adv-workshop"
              onClick={() => {
                setPos({ x: 5010, y: 550 });
                returnPosition = { x: 5010, y: 550 };
                setMapOpen(false);
                setDrawing(true);
              }}
            >
              ★ 별자리 공방에서 놀기
            </button>
          </div>
        )}
        {!mini && !drawing && !mapOpen && !garageOpen && !truckOpen && (
          <div className="adv-bottom adv-console">
            <p className="adv-touch-hint">{message}</p>
            <Joystick onMove={movement.setStick} />
            {region === "village" && (
              <button
                className="hj-car-mode"
                onClick={() => {
                  if (driving) {
                    setDriving(false);
                    setSiren(false);
                  } else setGarageOpen(true);
                }}
              >
                {driving ? "차에서 내리기" : "자동차 타기"}
              </button>
            )}
            <div className="adv-action-buttons">
              <button
                className="adv-map-button"
                onClick={() =>
                  region === "village"
                    ? setMapOpen(true)
                    : region === "coast"
                      ? goHomeInside()
                      : backToWorld()
                }
              >
                {region === "village" ? "지도" : region === "coast" ? "큰 집" : "해변"}
              </button>
              <button className="adv-interact" onClick={interact} disabled={!ready}>
                {region === "mansion" || submarine || atOriginalHouse || pos.x > 5700
                  ? actionLifeLabel()
                  : diving
                    ? "물 밖으로 나오기"
                    : call && callPhase === "dispatched" && nearTarget
                      ? call.kind === "fire"
                        ? "물 뿌리기"
                        : call.kind === "police"
                          ? "도둑 잡기"
                          : "사람 돕기"
                      : isNearCamp(pos) && !driving
                        ? "캠핑하기"
                        : isNearLake(pos) && !driving
                          ? "잠수하기"
                          : nearDrawing
                            ? "별자리 그리기"
                            : friend
                              ? `${friend.friend} · 이야기`
                              : nearby
                                ? `${nearby.name} · 시작`
                                : Math.hypot(pos.x - 1420, pos.y - 1030) < 100
                                  ? "보리 돌보기"
                                  : "놀이 · 대화"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="adv-footer">
        <p role="status">{message}</p>
        <span>왼쪽 조이스틱으로 이동 · 오른쪽 버튼으로 놀이와 대화</span>
      </div>
      {truckOpen && (
        <div className="hj-food-backdrop">
          <section
            className="hj-food-shop"
            role="dialog"
            aria-modal="true"
            aria-label="푸드트럭 메뉴"
          >
            <header>
              <h2>🍕 현준이 푸드트럭</h2>
              <button onClick={() => setTruckOpen(false)}>닫기 ✕</button>
            </header>
            <p>
              손님 주문: <strong>{FOOD_MENU.find((f) => f.id === order.foodId)?.name}</strong> ·
              음식을 고르고 손님에게 가져다줘!
            </p>
            <div className="hj-food-menu">
              {FOOD_MENU.map((food) => (
                <button
                  key={food.id}
                  aria-pressed={holding === food.id}
                  onClick={() => {
                    setHolding(food.id);
                    if (food.id === order.foodId) {
                      setOrder((prev) => ({ ...prev, phase: "prepared" }));
                      setMessage("주문한 음식을 손에 들었어. 손님에게 전달하자!");
                    } else {
                      setMessage("손님이 원하는 메뉴를 골라야 해!");
                    }
                  }}
                >
                  <span style={{ fontSize: 20 * food.size }}>{food.emoji}</span>
                  <b>{food.name}</b>
                  <small>{food.price} 별코인</small>
                </button>
              ))}
            </div>
            <p>
              {order.phase === "prepared"
                ? "✅ 주문 음식 준비 완료! 손님에게 가서 전달하자."
                : "주문에 맞는 메뉴를 골라 줘."}
            </p>
            <button onClick={() => setTruckOpen(false)}>트럭에서 나와 손님 만나기</button>
          </section>
        </div>
      )}
      {garageOpen && (
        <Garage
          selected={carId}
          onSelect={(id) => {
            setCarId(id);
            saveCarId(id);
            setDriving(true);
          }}
          onClose={() => setGarageOpen(false)}
        />
      )}
      {drawing && (
        <Constellation
          onClose={() => {
            setDrawing(false);
            setMessage("별자리가 반짝반짝! 다음 마을로 떠나 볼까?");
            viewport.current?.focus();
          }}
        />
      )}
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
