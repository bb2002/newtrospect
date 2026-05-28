---
name: newtrospect-tune
description: newtrospect 프롬프트 개선 하네스의 오케스트레이터. 한 사이클 = 데이터 수집(daum/naver/zum 무작위 방문 → 뉴스/비뉴스 100+100 분류) → 본문 추출 fixture → 7기능(detect·사전지식·편파(빨강)·중요문장(노랑)·어려운용어(파랑)·검색필요수치(초록)·한줄요약) gold 논의 + 프롬프트/모델 튜닝 → /goal(95%) 도달까지 반복 → API 연동성 QA. "사이클 시작", "프롬프트 튜닝 하네스", "뉴스 판단/마킹 튜닝", "데이터 수집하고 튜닝", "다시 실행/재실행/업데이트/보완", "특정 기능만 다시 튜닝", "이전 결과 기반 개선" 요청 시 사용. 단순 질문은 직접 응답.
---

# newtrospect 프롬프트 튜닝 하네스 — 오케스트레이터

한 사이클의 전체 흐름을 조율한다. 데이터 수집 → 전처리 → 7기능 generate-verify 튜닝 → QA.
**실행 모드: 하이브리드** — 수집/전처리/QA 는 서브 에이전트, 7기능 튜닝은 생성-검증 팀.

## 사이클 시작 조건

사용자가 "사이클 시작" / "튜닝 시작"이라고 명시할 때 시작한다(데이터 수집은 시간·토큰이 크므로 자동 시작 금지).

## Phase 0: 컨텍스트 확인 (먼저 실행)

기존 산출물을 보고 실행 모드를 정한다:
- `_workspace/` 미존재, news.md 미존재 → **초기 실행** (Phase A 부터 전체).
- `news.md`/`non-news.md` + `apps/worker/fixtures/` 존재, 사용자가 "특정 기능만 다시" → **부분 재실행**
  (Phase A·B 건너뛰고 해당 기능 Phase C 만; 그 기능의 goldset-author→prompt-tuner→eval-judge 루프만).
- 산출물 존재 + "새로 수집"/"새 데이터" → **새 실행** (기존 `_workspace/`→`_workspace_prev/`, news.md→백업 후 Phase A).
- 진행 중 사이클 재개 → `_workspace/eval/*/PASS.md` 로 어디까지 됐는지 파악 후 미합격 기능만 이어서.

**runTag 부여:** 이 사이클에 버전 태그(예: `YYYYMMDD-HHMM`)를 부여한다. 모든 eval 산출물은 `_workspace/eval/<feature>/<runTag>/`
에 버전별 보존하고, 기능별 최종 결과를 `_workspace/history.jsonl` 에 누적해 사이클·라운드 간 **회귀를 추적**한다.

전제 확인: worker dev 기동(`cd apps/worker && pnpm dev`), Gemini 사용 시 `GEMINI_API_KEY` secret. 없으면 사용자에게 요청.

## Phase A: 데이터 수집 (서브 에이전트)

`newtrospect-data-collector` 를 호출(`Agent(subagent_type:"newtrospect-data-collector", model:"opus")`).
- 산출: `news.md`, `non-news.md`(각 100), `_workspace/01_data-collector_report.md`.
- 라벨이 F1 gold 이므로 detect API 로 라벨링 금지(자기참조 오염). 완료 보고 받고 수량·분포 확인.
- **라벨 더블체크:** 각 URL 을 2회 독립 판정(구조/내용) 합의로 확정. 리포트의 agreement rate·불일치 목록을 확인한다.

## Phase B: 본문 추출 fixture (서브 에이전트)

`newtrospect-fixture-builder` 호출.
- 산출: `apps/worker/fixtures/{news,non-news}/<id>.json`, `_workspace/02_fixture-builder_report.md`.
- 추출 성공률 <70% 면 셀렉터/차단 점검 후 진행 여부 판단.

## Phase C: 7기능 generate-verify 튜닝 (에이전트 팀)

**팀 구성:** `TeamCreate` 로 `newtrospect-goldset-author` + `newtrospect-prompt-tuner` + `newtrospect-eval-judge`.
리더(오케스트레이터)가 기능을 하나씩 `TaskCreate` 로 분배하고, 팀원은 `SendMessage` 로 자체 조율한다.

**기능 순서(권장):** F1 detect → F7 oneline → F2 briefing → F5 term → F6 quantitative → F4 context → F3 sensational.
(쉬운 분류·요약 먼저로 파이프라인·도구를 검증한 뒤 까다로운 마킹으로.)

**⚠️ 전수 평가 강제:** 모든 점수·합격은 *수집 전체*(detect 200 / 뉴스 100)에서만 계산한다. 샘플링·일부 추출로
합격을 선언하는 것은 금지(꼼수). 각 기능 PASS 는 coverage 100% 가 필수다. 정본 규칙은 `references/features.md`
"전수 평가 강제 규칙" — 종료는 Phase E 감사 게이트가 강제한다.

**기능별 루프(생성-검증):**
1. goldset-author: 해당 기능 gold 작성(codex+opus 격렬 논의). F1 은 데이터 라벨이 gold(경계 케이스만 재검수).
2. prompt-tuner: 프롬프트 from scratch 작성 + 빠른 모델 선택 → eval-judge 에 재측정 요청.
3. eval-judge: 프로덕션 경로로 채점 → 점수·실패 케이스 → prompt-tuner.
4. prompt-tuner: 실패 패턴 일반화 수정 → 반복. /goal(95%) 도달까지.
5. 서버 schema/엔드포인트 변경이 있었으면 `newtrospect-api-qa` 점진 호출(아래 Phase D 와 동일 기준).
6. eval-judge: **전수**(샘플 금지) 최종 측정 — coverage 100% 로 pass rate ≥ 95% 확인 →
   `_workspace/eval/<feature>/PASS.md`(점수·coverage·모델·프롬프트 버전).

각 기능 정의·gold 기준·metric·goal 은 `references/features.md`(이 스킬 디렉토리)에 있다 — 팀원에게 경로를 알려준다.

> **rewrite 제거는 Phase C 초반(또는 Phase D)에 prompt-tuner+api-qa 로 처리.** `references/features.md` 제거 대상 참조.

## Phase D: API 연동성 QA (서브 에이전트, 점진 + 최종)

`newtrospect-api-qa` 를 (1) 서버 schema/엔드포인트 변경 직후마다, (2) 사이클 종료 전 최종 1회 호출.
- 산출: `_workspace/qa/<change>.md`. 불일치 발견 시 prompt-tuner 로 라우팅해 수정.
- 회귀 금지 영역(context 클릭 4중 방어) 무사 확인.

## Phase E: 전수 사용 감사 게이트 (종료 조건 — 강제)

사이클은 이 감사를 통과해야 **비로소 종료**된다(사용자 강제 규칙, 2026-05-28). 리더가 직접 검증한다:
1. **수량:** `news.md` 줄 수 == 뉴스 fixture 수 == 100, `non-news.md` 줄 수 == 비뉴스 fixture 수 == 100 (총 200).
2. **기능별 coverage:** 각 기능 `_workspace/eval/<feature>/responses.json` 의 `coverage == 100%`(collected == evaluated).
   detect 는 200개 전부, F2~F7 은 뉴스 100개 전부 평가됐는가. `skipped`(추출 실패) > 0 이면 미통과.
3. **gold 전수:** F2~F7 각 기능의 `_workspace/gold/<feature>/` 가 뉴스 100개 *전부*에 존재(누락 0).
4. **PASS 근거:** 각 `PASS.md` 점수가 coverage 100% 측정에서 나왔는지 확인. 부분집합 점수면 무효 → 재측정.

**미통과 시:** 사이클 종료 금지. 누락·추출 실패 항목을 채우거나(수집 단계에서 분석 가능한 URL 로 교체) 전수 재측정한
뒤 다시 감사한다. 통과 전까지 "완료" 보고 불가. 이 게이트는 어떤 이유(속도·비용)로도 건너뛰지 않는다.

## 데이터 전달 프로토콜

- **태스크 기반:** Phase C 팀 조율은 `TaskCreate`/`TaskUpdate`(기능별 작업·의존).
- **메시지 기반:** 팀원 간 재측정 요청·점수 전달은 `SendMessage`.
- **파일 기반(산출물):** `_workspace/` 하위 — `01_*`·`02_*` 리포트, `gold/<feature>/`, `eval/<feature>/<runTag>/`,
  `history.jsonl`(회귀 추적), `tune/<feature>/`, `qa/<change>.md`. fixtures 는 `apps/worker/fixtures/`. 중간 파일은 보존(감사 추적).
- **반환값 기반:** 서브 에이전트(A/B/D)는 결과 요약+파일 경로를 리더에 반환.

## 에러 핸들링

- 서브 에이전트 1회 재시도 후 재실패 → 해당 결과 없이 진행하되 최종 보고서에 *누락 명시*.
- worker dev 미기동/`GEMINI_API_KEY` 미설정 → 사용자에게 요청(폴백: Workers AI 모델).
- 한 기능이 3라운드 이상 /goal 미달 → 모델 교체 시도 → 그래도 막히면 사용자에게 보고하고 다음 기능으로(나중에 재시도).
- gold vs prompt-tuner 상충 → gold 를 삭제하지 말고 *본문 근거*로 재판단, 출처(논의 로그) 병기.
- 팀은 세션당 하나만 활성 — Phase C 종료 후 `TeamDelete`(팀 재구성 필요 시).

## 완료 후

0. **Phase E 전수 사용 감사 게이트 통과 필수** — 미통과면 종료 불가(Phase A/C 로 복귀). 통과해야 아래로 진행.
1. 최종 보고: 기능별 최종 정확도·coverage·채택 모델·미합격 항목.
2. **하네스 진화 기회 제공:** "결과/팀 구성/워크플로우에서 바꿀 부분이 있나요?" 피드백 수집(강요 X).
   피드백 유형별 수정 대상 — 결과 품질→해당 스킬, 역할→에이전트 정의, 순서→이 오케스트레이터, 트리거 누락→description.
3. **CLAUDE.md 변경 이력** 테이블에 이번 실행에서 바뀐 에이전트/스킬/프롬프트를 1줄 기록.
4. 메모리의 `project_spec06_results` 등 stale 기록이 이번 결과와 다르면 갱신 제안.

## 테스트 시나리오

- **정상 흐름:** "사이클 시작" → Phase 0(초기 실행 판정) → A(100+100) → B(fixture, 성공률 OK) → C(F1→…→F3 각 95%↑, 전수) →
  D(QA 통과) → E(전수 사용 감사 게이트: coverage 100%) → 보고 + 피드백 요청. 산출물: news.md/non-news.md/fixtures/_workspace 전부 생성, 7기능 PASS.md.
- **게이트 실패 흐름:** Phase E 에서 어떤 기능 coverage 92%(뉴스 8개 추출 실패) 발견 → 종료 *차단* → 수집 단계로 복귀해 8개를
  분석 가능한 URL 로 교체 → fixture 재생성 → 해당 기능 전수 재측정 → 다시 Phase E. 통과 전 "완료" 불가.
- **에러 흐름:** Phase B 추출 성공률 60% → 리더가 경고, 셀렉터 보강 또는 사용자 확인 후 진행. worker dev 미기동 →
  eval-judge 호출 실패 → 리더가 사용자에게 `pnpm dev` 요청 후 재개.
- **부분 재실행:** "term 마킹만 다시 튜닝" → Phase 0 가 부분 재실행 판정 → A·B 건너뜀 → F5 루프만 → 전체 재측정 → 보고.
