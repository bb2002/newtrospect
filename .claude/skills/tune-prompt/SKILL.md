---
name: tune-prompt
description: newtrospect 서버 프롬프트와 모델을 from scratch로 작성·튜닝한다. eval 점수를 보며 빠른 모델(Gemini flash 계열/Workers AI)을 골라 /goal(95%)까지 프롬프트를 반복 수정. detect·사전지식·편파·중요문장·어려운용어·수치·요약 프롬프트 작성/수정, "프롬프트 튜닝", "모델 교체", "정확도 올리기" 요청 시 사용.
---

# 서버 프롬프트/모델 튜닝

각 기능의 worker 프롬프트와 모델을 만들고, eval-judge 점수를 보며 /goal 에 도달시킨다.
기능 정의·metric·goal 은 `.claude/skills/newtrospect-tune/references/features.md` 를 따른다.

## 절대 원칙: 기존 프롬프트 비참조

`apps/worker/src/prompts.ts` 의 기존 프롬프트 *본문*을 복사·참고하지 않는다(사용자 명시). features.md 의 기능 정의와
eval 실패 케이스만 보고 새로 쓴다. 파일 *배선*(export 이름, `withTimeHeader`, `callAux`, 파서)은 유지한다 —
배선은 코드 구조이지 프롬프트 내용이 아니다. 배선 상세는 `references/server-wiring.md` 참조.

## 튜닝 루프 (한 번에 한 기능)

1. **프롬프트 초안 작성** — features.md 의 정의를 LLM 이 따를 수 있게 명령형으로. 출력 형식(JSON schema)을 명시.
   마킹 기능은 "원문 substring 만 출력, 변형 금지, 확신 없으면 출력 금지" 규칙 포함(서버가 substring 매칭으로 좌표화).
2. **모델 선택** — 빠른 모델만. `references/server-wiring.md` 의 모델/프로바이더 설정 방법 + `references/models.md` 의
   후보. Workers AI 최신 목록은 https://developers.cloudflare.com/workers-ai/models/ 를 WebFetch.
3. **eval 요청** — 직접 채점하지 말고 eval-judge 에게 재측정을 요청(채점 독립성). worker dev 가 떠 있어야 함.
4. **실패 분석 → 일반화 수정** — eval-judge 의 실패 케이스를 *패턴으로 묶어* 원리 수준 규칙으로 고친다.
   개별 fixture 통과용 좁은 규칙(오버피팅) 금지.
5. **반복** — /goal 도달까지(프롬프트 라운드 상한·자동 모델 스윕은 아래 "자동화").
6. **전수 확정** — 모든 측정은 전체 세트(detect 200 / 뉴스 100)에서. 부분집합 합격은 무효(features.md 전수 규칙).
   eval-judge 가 coverage 100% 로 pass rate ≥ 95% 를 확인해야 그 기능이 합격이다.

## 자동화 (라운드 상한 · 모델 스윕)

루프가 무한히 돌거나 오버피팅으로 빠지지 않도록 자동 전환 규칙을 둔다:
1. **프롬프트 라운드 상한:** 한 기능당 프롬프트 반복 *최대 5라운드*. 매 라운드는 가설 1개를 일반화 수정으로 검증
   (notes.md 기록, 이미 시도한 가설 반복 금지).
2. **상한 도달 → 모델 스윕:** 5라운드에도 /goal 미달이면 *현재 best 프롬프트를 고정*하고 `references/models.md`
   후보 빠른 모델을 차례로 적용해 **전수 측정**한다(프롬프트는 변수에서 제외 — 회귀 원인 명확화).
3. **스윕 채택 기준:** ① pass rate 최고 → ② 동률이면 p95 elapsedMs 가 빠른 모델(정확도 우선, 속도는 tie-break).
4. **스윕도 미달 → 보고:** 최고 모델로도 미달이면 오케스트레이터/사용자에 보고. gold 재검토(goldset-author)·기능 정의
   (features.md) 점검을 제안하고, 그 기능은 *미합격*으로 두고 다음 기능 진행(나중 재시도).
5. **오버피팅 가드(자동화 시 특히):** 라운드 상한 압박에 *특정 fixture 통과용 좁은 규칙*을 박지 말 것. 점수가 올라도
   다른 케이스를 깨뜨리면(회귀 추적이 잡음) 무효. 자동화하는 것은 *모델 탐색*이지 *오버피팅*이 아니다.

## 프롬프트 작성 원칙 (일반화)

- **Why 를 담아라:** "왜 포함/제외하는가"를 모델에게 설명하면 엣지 케이스에서 옳게 판단한다. 예시는 원리를 보이는
  최소 few-shot 으로(특정 fixture 통과용 암기 예시 금지).
- **출력 형식 엄격:** JSON 객체 하나만. 마크다운 펜스·설명·인사말 금지(서버 파서가 `{`~`}` 만 추출).
- **마킹 단위 준수:** term=단어/명사구, quantitative=수치 구, sensational/context=완결 문장. features.md 단위 표 참고.
- **시간 의존 표현:** detect 외 분석은 `withTimeHeader` 로 KST 시각이 앞에 붙는다('오늘/최근/현재' 해석용).

## API 연동성 (필수)

프롬프트만 바꾸면 응답 shape 이 그대로라 안전하다. 그러나 **엔드포인트/응답 키/타입을 바꾸면** worker↔core↔
extension/mobile 이 깨진다. 그런 변경 후에는 반드시 api-qa 에게 점검 요청하거나 `api-connectivity-check` 기준으로
자가 점검한다. 특히 `rewrite_sensational` 제거 시 고아 참조가 없도록(features.md 제거 대상 참조).

## 산출

- 수정된 `apps/worker/src/prompts.ts`(해당 export) / `apps/worker/wrangler.toml`(MODEL_*/PROVIDER_*).
- `_workspace/tune/<feature>/notes.md`: 라운드별 가설→수정→점수. *이미 시도한 가설을 반복하지 않기 위함*.

## 막힐 때

- worker dev 미기동 → 오케스트레이터에 알림(`cd apps/worker && pnpm dev`).
- GEMINI_API_KEY 미설정 → Workers AI 모델로 우회하거나 사용자에게 `wrangler secret put GEMINI_API_KEY` 요청.
