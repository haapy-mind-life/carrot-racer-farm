# 07. 다음 세션 GPT / Claude / Codex 인수인계

> 목적: 새로운 세션/에이전트가 **원문 요구와 실제 코드 상태를 혼동하지 않도록** 최소 경로를 제공한다.

## 즉시 캐치업

- Repository: `haapy-mind-life/carrot-racer-farm`; default branch `main`.
- 이번 문서 조사 기준 SHA: `7fd147ad8d46aebe3075368b10271c67cd62b0eb`. 후속 세션은 반드시 현재 `main` SHA를 다시 읽는다.
- 게임 URL: https://haapy-mind-life.github.io/carrot-racer-farm/
- 기존 `main` 배포 성공 근거: https://github.com/haapy-mind-life/carrot-racer-farm/actions/runs/38105386742
- 핵심 원칙: **큰 집/로봇/바다/잠수함/푸드트럭·장사는 월드에서 직접 돌아다니며 하는 경험**. 카드 나열·미니게임 전환으로 바꾸지 말 것.
- 기존 별코인 공용 지갑 사용; v2 세이브 및 차량 선택 키 보존.
- 본 패키지 작성은 구현을 허가하지 않는다.

## SSOT 읽는 순서

```
MEMORY.md
└─ docs/README.md
   └─ docs/world-expansion/2026-10-11-v0.1.0/
      ├─ README.md
      ├─ 01_REQUIREMENTS.md
      ├─ 02_AS_IS_CODE_AUDIT.md
      ├─ 03_OPEN_WORLD_EXPERIENCE.md
      ├─ 04_FOOD_TRUCK_AND_ECONOMY.md
      ├─ 05_ENGINEERING_REVIEW.md
      ├─ 06_ACCEPTANCE_AND_UAT.md
      ├─ 07_AGENT_HANDOFF.md
      └─ 08_DECISIONS.md
```

## 사실 / 제안 / 공백

| 구분 | 내용 |
| --- | --- |
| FACT | 5600×1800 현재 월드, 10마을, 100종 차량(10×10), 신고 4종/소방차·구급차·경찰차 출동, 호수 잠수/캠핑, v2 지갑/가구. |
| REQUEST | 아빠 로봇, 대형 집·들기/먹기, 큰 바다/잠수함/해저, 푸드트럭 장사/별코인, 돈까스·김치·피자·콜라·대왕 피자·거대 황금 피자/기타 거대 메뉴. |
| PROPOSED | 월드 통합 단일 경험 웨지. 구역 연결 방식, 공용 지갑의 주문 트랜잭션 원자화, 실기기 UX 기준. |
| UNKNOWN | 자동차 '더'의 의미, 로봇 기능, '비상도', 큰 집 크기/방, 해저 규모, 푸드트럭 조리·주문·가격/자동 손님. |
| NOT VERIFIED | 실제 Samsung Browser/S Pen, 신규 기능의 CI/배포/UAT. |

## 작업 권한 구분

- 현재 단계 허가: 조사 문서 작성, 보완, 계획, 코드/CI 사실 확인.
- 다음 단계로 **신규 코드 구현·UI 추가·에셋 추가·게임 배포**는 별도 사용자 승인 필요.
- 그 전에 `08_DECISIONS.md` OPEN 중 첫 범위에 영향을 주는 결정을 정하고, `05_ENGINEERING_REVIEW.md` 승인 게이트를 충족.
- 구현 시 feature branch + PR, 기존 이력 force push/rebase/amend 금지(`AGENTS.md`).
- 결과 보고는 코드/테스트/배포/실기기 검증을 분리.

## 추천 다음 작업 (3개)

1. 현준이/보호자에게 **의미가 불명확한 3가지만** 확인: 자동차 확장 방향, 아빠 로봇 역할, '비상도' 정확한 대상. 큰 집·푸드트럭 상세는 첫 상호작용 프로토타입에서 보여주며 확인 가능.
2. 현재 `main`과 새 문서를 기준으로 **월드/세이브/경제 확장 기술 검토**를 완료하고 한 세션 내 체험 시나리오를 정리.
3. 명시 승인 후 첫 작은 기능 PR → Actions·Pages 검증 → 기기 실사용 확인.

## 복사 가능한 후속 작업 프롬프트

> 박현준 게임 GitHub 저장소 `haapy-mind-life/carrot-racer-farm` 최신 main부터 read-only로 캐치업하라. 먼저 루트 MEMORY.md, docs/README.md, docs/world-expansion/2026-10-11-v0.1.0의 모든 문서와 AGENTS.md를 읽고 FACT/REQUEST/PROPOSED/UNKNOWN을 구분하라. 현준이의 요구는 메뉴 기반 미니게임이 아니라 직접 움직이는 큰 생활형 오픈월드이다. 아빠 로봇, 대형 집에서 들고 먹기, 큰 바다와 잠수함 탐험, 푸드트럭 장사와 별코인, 요청된 음식 메뉴를 중심으로 기존 게임과의 정합성을 검토하라. 승인되지 않은 기능을 구현하지 말고, 기존 10개 마을·100종 차량·구조 신고·러너·농장·집·세이브를 보존하며 08_DECISIONS.md의 OPEN 항목과 구현/테스트/배포/실기기 검증 차이를 정확히 보고하라.

## 릴리스와 유지보수 메모

- GitHub Pages 설정 및 실기기 검증: `docs/DEPLOY_GITHUB_PAGES.md`
- 기존 통합 범위: `docs/superpowers/specs/2026-09-15-hyunjun-integrated-game-design.md`
- 최신 구현 상태는 반드시 코드/CI를 읽고 갱신; 문서의 기준 SHA를 '현재 최신'으로 무비판적으로 복제하지 말 것.
- 개인정보를 다루지 않고, 사용자의 실제 사진/음성 수집 기능은 별도 요청·검토 없이는 추가 금지.

