# worker 배선 — 프롬프트/모델을 어디서 바꾸나

> 이건 *코드 구조*다(프롬프트 *내용* 아님). 내용은 from scratch 로 쓰되, 아래 배선은 유지·활용한다.

## 프롬프트 위치 — `apps/worker/src/prompts.ts`

- 4종 마킹: `PROMPTS: Record<AnalysisKind, { system, itemKeys }>` — `term`/`sensational`/`quantitative`/`context`.
  - `system` = 시스템 프롬프트 문자열. `itemKeys` = 응답 item 의 키(예: term 은 `["text","explanation"]`).
- 단건 판정/생성: `DETECT_PROMPT`, `BRIEFING_PROMPT`, `ONELINE_PROMPT` (그리고 제거 대상 `REWRITE_SENSATIONAL_PROMPT`).
- `withTimeHeader(base)` — base 앞에 KST 시각 헤더를 붙임. detect 포함 시간 의존 분석에 사용.
- `DETECT_SAMPLE_CP` — detect 에 보낼 본문 코드포인트 길이(현재 2000).

## 엔드포인트·핸들러 — `apps/worker/src/index.ts`

- 마킹 4종: `app.post("/api/analyze/{terms|sensational|quantitative|context}")` → `handleAnalyze` → `provider.analyze`.
- detect: `/api/detect-article` → `handleDetect` → `runDetect{WorkersAI|Gemini}` → `parseDetect`.
- briefing/oneline: `/api/analyze/{briefing|oneline}` → `callAux`(generic JSON) → `parse{Briefing|Oneline}`.
- 응답 파서가 `{`~`}` 만 추출하므로 프롬프트가 JSON 외 텍스트를 내면 깨진다.

## 모델/프로바이더 — `apps/worker/wrangler.toml` `[vars]`

- `MODEL_TERM/SENSATIONAL/QUANTITATIVE/CONTEXT/DETECT/BRIEFING/ONELINE` (+ CHARACTER/REWRITE).
- `PROVIDER_*` = `"gemini"` 또는 `"workers-ai"`.
- `env.ts` 의 `modelFor(env,kind)`/`detectModel`/`briefingModel`/`onelineModel` 이 위 값을 읽는다.
- Gemini 호출: `runGenericGemini`/`runDetectGemini` (response_mime_type=application/json, thinkingConfig 주의 —
  maxOutputTokens 는 thought+text 합산 캡).
- Workers AI 호출: `runGenericWorkersAI`/`runDetectWorkersAI` + `extractText`(모델별 응답 schema 흡수).

## 응답 shape (바꾸면 클라이언트 깨짐 — api-qa 점검 대상)

- 마킹: `{ spans: Span[], model, elapsedMs }`. Span payload — term:`{explanation}`, sensational:`{reason}`,
  quantitative:`{searchQuery}`, context:`{}`. (`packages/core/src/types.ts`)
- detect: `{ isArticle, cleanedText, reason? }`.
- briefing: `{ cards: [{title,body}×3], model, elapsedMs }`. oneline: `{ oneLine, model, elapsedMs }`.

## 모델은 바꿔도 shape 은 그대로

모델/프롬프트 교체는 응답 shape 을 바꾸지 않으므로 클라이언트 안전. *엔드포인트 경로·응답 키·타입*을 바꿀 때만
api-qa 점검이 필수다.
