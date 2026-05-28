---
name: build-fixtures
description: newtrospect 본문 추출 fixture를 만든다. news.md·non-news.md 의 URL을 fetch 후 익스텐션과 동일한 Readability 추출로 본문 평문을 뽑아 apps/worker/fixtures/ 에 JSON으로 저장. "서버로 보낼 입력 준비", "fixture 빌드", "본문 추출 저장", "전처리", "fixture 재생성" 요청 시 사용.
---

# 본문 추출 fixture 빌드

서버는 *HTML 전체가 아니라 클라이언트가 추출한 본문 평문 text* 를 받는다(`extractArticleText`:
사이트 셀렉터 → Readability 폴백). 평가가 프로덕션과 같으려면 fixture 도 *같은 추출 text* 여야 한다.
사용자 문서의 "서버로 보낼 HTML 저장"은 **"추출된 본문 text 저장"으로 해석**한다.

## 절차

1. **번들 스크립트 실행** (jsdom/@mozilla/readability 가 apps/worker 에 설치돼 있으므로 거기서 실행):
   ```bash
   cd apps/worker
   pnpm tsx ../../.claude/skills/build-fixtures/scripts/build-fixtures.ts
   ```
   - 읽기: `../../news.md`, `../../non-news.md`
   - 쓰기: `apps/worker/fixtures/{news,non-news}/<id>.json` (`<id>` = url sha256 앞 12자)
   - 캐시: 이미 있는 fixture 는 skip. 전체 재추출은 `FORCE=1`.
2. **추출 품질 확인:** 요약의 추출 성공률을 본다. <70% 면 셀렉터/UA/차단 문제 — 리포트에 경고.
3. **리포트 작성:** `_workspace/02_fixture-builder_report.md` 에 성공/실패 수, 평균 textLen, 실패 사유 분포.

## fixture 스키마

```json
{ "url": "...", "label": "news"|"non-news", "status": "ok|too_short|fetch_failed|extract_failed|blocked",
  "text": "추출된 본문 평문", "textLen": 1234, "extractedAt": "ISO", "httpStatus": 200 }
```

## 왜 status 가 중요한가

추출 실패·`too_short`(200자 미만)는 *익스텐션도 분석을 건너뛰는* 상태다. F1 detect 평가에서 이들은
"비뉴스 예측과 등가"로 취급된다(익스텐션이 분석을 안 하므로 사용자에겐 비뉴스와 같은 결과). 따라서 status 를 정확히 남긴다.

## 참고: 프로덕션 추출과의 일치

- 정규화: `text.replace(/\s+/g," ").trim()` — 서버 `normalize` 및 좌표계(코드포인트)와 동일.
- 등록 사이트는 익스텐션이 `selectors.ts` 셀렉터를 우선 쓰지만, 스크립트는 Readability 만 쓴다. 대부분 본문은
  동일하게 잡히나, 셀렉터 사이트에서 차이가 크면 `packages/core/src/extract.ts` 의 셀렉터 분기를 스크립트에 반영해
  더 충실히 재현할 수 있다(필요 시 prompt-tuner/오케스트레이터와 협의).
- 스크립트 수정이 필요하면 번들 파일(`build-fixtures.ts`)을 고치되, 캐시(이미 있는 fixture skip) 로직을 유지한다.
