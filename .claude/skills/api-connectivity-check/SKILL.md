---
name: api-connectivity-check
description: newtrospect worker↔core↔extension/mobile API 연동성을 교차 검증한다. 서버/클라이언트 수정 시 엔드포인트·요청 body·응답 shape·타입을 1:1 대조해 통신이 깨지지 않았는지, 제거된 기능(rewrite)의 고아 참조가 없는지 확인. "API 연동 체크", "경계면 검증", "통신 확인", "rewrite 제거 확인" 요청 시 사용.
---

# API 연동성 교차 검증

*경계면 버그*를 잡는다. "worker 가 보내는 것"과 "core/extension/mobile 이 기대하는 것"의 shape 불일치가 핵심이다.
사용자 명시 주의: 서버 또는 클라이언트를 수정하면 두 통신이 어긋날 수 있으므로 변경마다 점진 검증한다.

## 핵심 원칙: 존재 확인이 아니라 교차 비교

한쪽 파일만 보고 "있네" 하지 말 것. *양쪽을 동시에 열어* 필드명·타입·경로·키를 1:1 대조한다.

## 계약 지점 체크리스트 (모두 확인)

1. **엔드포인트 경로:** `packages/core/src/types.ts` 의 `ANALYZE_ENDPOINTS`·`*_ENDPOINT`
   ↔ `apps/worker/src/index.ts` 의 `app.post("/api/...")` 라우트. 경로 한 글자라도 다르면 404.
2. **요청 body:** `packages/core/src/client.ts` 의 `post(path, body)` 가 보내는 키
   ↔ worker 핸들러의 `req.json()` 파싱 키(`text`, `url`, `lang`, `reason` 등).
3. **응답 shape:** worker `Response.json({...})` ↔ core 타입(`AnalyzeResponse`/`DetectArticleResponse`/
   `BriefingResponse`/`OneLineResponse`) ↔ 소비처:
   - extension: `apps/extension/src/content/{index,highlight,popover,cards}.ts`
   - mobile: `apps/mobile/.../injection/*` (있으면)
   - 특히 `Span.payload` 키(term:`explanation`, sensational:`reason`, quantitative:`searchQuery`, context:`{}`).
4. **제거 항목 고아 참조(rewrite_sensational):** 제거 시 *모두* 사라졌는지 —
   worker 라우트 `/api/rewrite/sensational`·`handleRewriteSensational`·`REWRITE_SENSATIONAL_PROMPT`,
   core `rewriteSensational`·`REWRITE_SENSATIONAL_ENDPOINT`·`RewriteSensational*` 타입,
   extension/mobile popover '온화한 표현으로 보기' 버튼·핸들러,
   `env.ts`/`wrangler.toml` 의 `*_REWRITE` 변수. grep 으로 잔존 참조 0 확인.
5. **회귀 금지 영역:** CLAUDE.md "context 하이라이트 click 4중 방어"와 popover 클릭 메커니즘은 rewrite 버튼
   제거와 무관하게 유지돼야 한다. `attachMarkClickHandler`·capture-phase listener·target redirect·payload 백업이
   살아있는지 확인.

## 실행 방법

1. **타입/빌드:** 고아 참조·shape 불일치는 타입 체크가 많이 잡는다.
   ```bash
   pnpm -r typecheck    # 없으면: 각 패키지에서 tsc --noEmit / pnpm build
   ```
2. **grep 교차 확인:** 제거/변경한 심볼을 repo 전역 grep 해 잔존 참조 0 확인.
3. **shape 대조표 작성:** 계약 지점별 worker측↔client측 값을 표로 나란히.

## 출력

`_workspace/qa/<change>.md`:
- 계약 지점별 OK/불일치 표(worker 값 ↔ client 값).
- 발견한 고아 참조·shape 불일치: 파일:라인 + *어느 쪽을 고쳐야 하는지*.
- 타입체크/빌드 결과.

## 막힐 때

- 빌드 실패 → 에러 원문 인용 + 원인 파일 지목. 임의 통과 금지.
- 못 고치면 막힌 지점을 명확히 보고(추측으로 덮지 않음). prompt-tuner 가 수정하도록 라우팅.
