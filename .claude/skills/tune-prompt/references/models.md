# 모델 후보 (빠른 응답 모델만)

사용자 제약: **Cloudflare Workers AI 또는 Gemini flash 계열의 빠른 응답 모델**만 사용. pro 계열은 지연·비용이 커
가급적 피한다. 아래는 출발점이며, 최신 가용성은 항상 1차 출처로 확인한다.

## Gemini (provider = "gemini", GEMINI_API_KEY 필요)
- `gemini-flash-lite-latest` — 가장 빠름/저렴. 단순 분류(예: detect)에 적합.
- `gemini-flash-latest` — 빠름+품질 균형. 대부분 분석의 기본 후보.
- `gemini-3.1-pro-preview` — 느림/비쌈. *원칙적으로 회피*. 품질이 도저히 안 나오는 기능에서만 마지막 수단으로 검토.

## Workers AI (provider = "workers-ai", env.AI 바인딩)
- 최신 목록: **https://developers.cloudflare.com/workers-ai/models/ 를 WebFetch 로 확인** (모델이 자주
  추가/deprecate 됨). text-generation 카테고리에서 빠른 instruct 모델을 고른다.
- 과거 이 프로젝트 경험(메모리): `@cf/meta/llama-3.1-8b-instruct` 가 균형 양호. 70b 는 일부 task↑·일부 task↓.
  `qwen1.5-14b`·`gemma-2-9b` 는 Cloudflare 측 deprecation/미호스팅으로 호출 불가였던 이력 — 호출 전 가용성 확인.
- 응답 schema 가 모델마다 달라 `extractText`(workers-ai.ts) 가 다중 schema 를 흡수한다. 새 모델이 깨지면 거기 보강.

## 기능별 모델 선택 가이드
- detect(F1): 호출량 많고 빠른 판정만 필요 → flash-lite 우선.
- 마킹(F3~F6)·사전지식(F2): 추론 부담 있음 → flash 우선, 부족하면 Workers AI 중간 모델 비교.
- oneline(F7): 압축만 → flash/flash-lite.

## 측정 원칙
- 모델 교체는 *프롬프트 고정* 상태에서 단독으로 측정(변수 분리). 프롬프트와 모델을 동시에 흔들면 원인 추적 불가.
- 속도(p95 elapsedMs)도 함께 본다 — 정확도가 같으면 더 빠른 모델 채택.
