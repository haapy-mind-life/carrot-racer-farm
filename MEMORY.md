# MEMORY.md — 박현준 게임 공용 작업 기억

> 상태: repository handoff / 2026-10-11 / v0.1.0. 개인적인 장기 기억이 아니라 **이 저장소 작업을 이어가기 위한 버전 관리 문서**다.
> 마지막 코드 조사 기준: `main` `7fd147ad8d46aebe3075368b10271c67cd62b0eb`. 해당 SHA 이후 변경은 반드시 다시 확인한다.
> 요구사항 자료는 현준이와 보호자의 대화에 근거한다. 미확정 해석은 결정하지 않는다.

## 반드시 기억할 제품 방향

1. 주인공이 넓은 세계를 **직접 걸어 다니고**, 터치 조이스틱·화면 버튼으로 친구·탈것·사물과 상호작용한다. 카드 메뉴 중심으로 되돌리지 않는다.
2. 현준이가 특별히 강조한 구조: **신고·구조·장사·잠수·집 생활은 별도 미니게임 선택 화면이 아니라 월드 안에서 실제 장소를 찾아 직접 행동**한다. 기존 러너/농장/집 페이지의 호환성은 유지해야 한다.
3. 친구는 주인공의 단순 복제가 아니라 외형이 분명히 달라야 한다. 캐릭터·친구는 충분히 커야 하며, 어린이용 손가락/터치펜 조작을 최우선으로 검증한다.
4. 자동차 100종은 현재 **10개 차체 계열 × 10가지 색상/이름**이다. 100개의 독립 차체로 표현하지 않는다. 추가 자동차 종류·규모는 미정이다.
5. 신규 요청: **아빠 로봇, 훨씬 큰 집과 음식 들기/먹기, 큰 바다 월드, 잠수함/해저 탐험, 푸드트럭 영업 및 별코인 획득**, 메뉴(돈까스·김치·피자·콜라·대왕 피자·엄청 큰 황금 피자·추가 거대 메뉴).
6. "비상도 만들어줘", "자동차보다 더", 로봇의 구체적 동작/외형 등은 음성 전사만으로 뜻을 확정하지 않는다. 원문 보존 + OPEN 결정으로 관리.
7. 긴급 구조는 어린이용 상상 놀이로 표현한다. 실제 응급처치 지침, 선정적인 상해 묘사, 실제 신고 연결, 실금전 결제는 금지한다.

## 검증된 현재 시스템 (코드 기준, 실제 기기 UAT 별개)

- 저장소: https://github.com/haapy-mind-life/carrot-racer-farm ; 정적 게임: https://haapy-mind-life.github.io/carrot-racer-farm/
- 월드: `src/game/adventure.ts`의 5600×1800 맵 / 열 개 마을 / `Village.tsx`의 조이스틱+현재 화면 지도.
- 탈것: `src/game/cars.ts`, `Garage.tsx`, `CarArt.tsx`; 100종 목록, 선택·탑승.
- 긴급 호출·호수·캠핑: `src/game/world-events.ts`, `WorldScenes.tsx`, `Village.tsx`, `siren.ts`; 신고/출동, 지정 지점 소화·구조·도둑 추적, 호수 잠수, 텐트.
- 집은 `src/components/hyunjun/House.tsx`의 **별도 가구 배치 화면/6개 슬롯**이며 오픈월드 대저택·들고 먹기는 아직 없다.
- `src/lib/world-model.ts`에 `GameState.version = 2`, `money`(별코인), 농장/러너/가구 구매 흐름이 있다. 푸드트럭 매출은 아직 없다.
- GitHub Pages는 `.github/workflows/pages.yml`에서 PR 빌드 검증, `main` push 후 배포. 최근 기준 커밋의 Actions 배포 성공: https://github.com/haapy-mind-life/carrot-racer-farm/actions/runs/38105386742
- **CI 및 Pages 배포 성공은 실제 삼성 브라우저/S Pen/화면 사용성 검증을 의미하지 않는다.**

## 문서 SSOT와 읽기 순서

1. `docs/README.md` — 문서 길잡이.
2. `docs/world-expansion/2026-10-11-v0.1.0/README.md` — 이 확장 작업 패키지의 범위/상태.
3. `01_REQUIREMENTS.md` — 현준이 원문 취지, 기능별 ID/수락 조건/불확실성.
4. `02_AS_IS_CODE_AUDIT.md` — 실제 코드 근거와 위험.
5. `03_OPEN_WORLD_EXPERIENCE.md` — 원활한 월드 경험/대안/제약.
6. `04_FOOD_TRUCK_AND_ECONOMY.md` — 메뉴, 경제, 저장 계약 초안.
7. `05_ENGINEERING_REVIEW.md` — 구현 승인 게이트/실패/보안/선택.
8. `06_ACCEPTANCE_AND_UAT.md` — 테스트와 실기기 검증.
9. `07_AGENT_HANDOFF.md` — 다음 GPT/Claude/Codex 세션 인수인계.
10. `08_DECISIONS.md` — LOCKED / OPEN / DEFERRED 의사결정.

## 작업·승인 규칙

- 현재 허가: **문서 패키지 생성/유지**. 이번 승인으로 게임 코드·에셋 구현이 자동 승인된 것이 아니다.
- 다음 구현 전: 변경 시점의 `main` 재조사 → 결정 미정 항목 확인 → 작은 월드 통합 시나리오 설계 → PR CI/Pages 검증 → 모바일 실기기 UAT.
- 코드 변경 시 별도 브랜치/PR, 기존 세이브 `hyunjun-game-v2` 및 `hyunjun-selected-car-v1` 보존, 안전한 마이그레이션. 배포 상태를 '코드', 'CI', '배포', '실기기'로 분리해 보고한다.
- `AGENTS.md`의 Lovable/Git 기록 안전 규칙 준수. 공개 저장소에 비밀키·실명 닮은꼴 사진·연락처 등 개인정보를 추가하지 않는다.
- 현재 결정 책임자: 요구사항·놀이 방식은 현준이/보호자, 기술 구현안 및 검증은 담당 에이전트, 최종 승인 및 UAT는 보호자.

