# newtrospect 프로젝트

## 주의 사항

- 한국어로 대화 할 것

## ⚠️ 절대 회귀 금지 — context 하이라이트 click 동작

**context (노란/bold+밑줄) 영역 안에 inline mark (sensational/quantitative/term) 가 nested 됐을 때 반드시 클릭이 잡혀야 하고 popover 가 떠야 한다.**

이 동작은 2026-05-26 까지 *세 번 회귀*했다. 다시 회귀시키면 안 됨. 변경 시 아래 4중 방어를 *모두* 유지할 것:

1. **per-element listener** — `apps/{extension,mobile}/.../popover.ts` 의 `attachMarkClickHandler(el)`. `apps/{extension,mobile}/.../highlight.ts` 의 `applyMark` 안에서 wrap 직후 호출. click + touchend 둘 다 단단.
2. **document capture-phase listener** — `setupPopovers` 안에서 `document.addEventListener("click", onDocCaptureClick, true)` + touchend. 페이지 자체 script 가 stopPropagation 으로 가로채는 사이트 우회 + per-element 누락 백업.
3. **target redirect** — `onMarkInteract` 안에서 `ev.currentTarget` 보다 `ev.target.closest("nts-mark")` (innermost) 가 우선. 부모 mark listener 만 trigger 된 케이스 대응.
4. **payload 백업** — `applyHighlights` Pass 1 에서 context mark 의 `dataset.payload` 에 *겹치는 inline spans 도 같이 저장*. Pass 2 wrap 이 실패해도 context click → popover 정상 표시.

**5. 분석 spans 통합 wrap (절대 분리 wrap 금지)** — `applyHighlights` 는 *모든 kind (term/sensational/quantitative/context) 의 spans 가 한 번에* 들어와야 `segmentInlineSpans` 가 boundary 를 정확히 분리할 수 있다. 각 kind 분석 도착마다 따로 `applyHighlights` 호출하면 안 됨. content/index.ts(extension) · injection/entry.ts(mobile) 에서 *Promise.allSettled 후 한 번* wrap. 분리 wrap 시 term+quantitative 부분 겹침 처리 깨지고 click 도 같이 깨진다.

**추가 안전망**:
- `surroundContents` 실패 시 `splitText` fallback (`applyMark`)
- CSS: `nts-mark { pointer-events: auto !important; position: relative; z-index: 1; cursor: pointer; touch-action: manipulation; }` + `nts-mark nts-mark { z-index: 2; }` (자식 우선 hit-test)
- 300ms dedupe (`lastHandledTs`) — capture + per-element + click+touchend 가 동시 trigger 되는 케이스

**테스트 케이스** (변경 후 반드시 확인):
- 한국 뉴스에서 *context 가 두꺼운 검정 밑줄로 표시된 문장* 안에 빨강/파랑/초록 마킹이 덧칠된 부분 클릭 → popover 표시되는가
- naver/daum 처럼 자체 script 가 강한 사이트에서 동일 클릭 → 잡히는가
- 모바일 WebView 에서 같은 영역 *터치* → popover 표시되는가

회귀 발견 시: 4중 방어 중 빠진 것이 무엇인지 grep 으로 확인 후 복구. 임의로 단순화하지 말 것.

## 프로젝트 개요

newtrospect = AI 기반 비판적 뉴스 읽기 보조 도구.
브라우저 익스텐션(Chrome/Firefox) + 안드로이드 앱(Expo Go WebView)이 한국 뉴스 사이트의 본문을 자동 감지하고 4가지 분석을 인라인 하이라이트로 보여줌:

- 노란색 -> 노란색 문장만 읽으면 이 글의 전반적은 내용을 알 수 있음. 중요한 문장을 의미.
- 초록색 -> 정량적 통계 데이터. 이 데이터를 신뢰하려면 검색을 해봐야 함.
- 파란색 -> 어려운 용어. 전문 도메인 지식이 없으면 이해하기 어려우므로 그 뜻을 쉽게 풀어줌.
- 빨간색 -> 자극적 표현. 독자에게 선동/흥분을 시킬 수 있는 자극적인 문장으로 읽는데 주의가 필요

서버: Cloudflare Workers + Workers AI(시작) → Gemini API(스왑 가능) + D1.

## 현재 상태 (2026-05-21)

- **Phase**: 스캐폴딩 + S2 spike 완료. 채택 모델 `@cf/meta/llama-3.1-8b-instruct`. D1 생성·로컬+원격 마이그레이션 완료.
- **선택된 접근**: Approach B (원안 + 확장성 강화, 1~2개월 예상)
- **디자인 문서**: `~/.gstack/projects/newtrospect/ballbot-main-design-20260519-185536.md` (Status: APPROVED, Spike Results S2 채워짐)
- **남은 spike**: S1 (Expo Go WebView) + 셀렉터 실측 — 둘 다 사용자 직접 실행
- **다음 액션**: STATUS.md의 "다음 액션" 참고

## 다음 세션 시작 가이드

1. 먼저 `STATUS.md` 읽기 — 현재 위치와 다음 액션이 정리되어 있음
2. 그 다음 디자인 문서의 "Spike Results" 섹션 (S2 결과·채택 근거) 읽기
3. 남은 spike (S1 Expo Go, 셀렉터 실측)는 사용자 직접 실행 필요

## 의사결정 로그

| 일자       | 결정                                                                    | 근거                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-19 | Approach B 채택 (원안 풀 비전)                                          | 빌더 모드 + 사용자가 풀 비전 유지 선호                                                                                                                            |
| 2026-05-19 | D1 누적 저장 Phase 1(캐시만) / Phase 2(매일 사용 검증 후) 단계화        | YAGNI 리뷰 일부 반영                                                                                                                                              |
| 2026-05-19 | 캐시 키 = 본문 SHA-256 (URL 아님)                                       | 같은 기사 다른 URL 변종 대응                                                                                                                                      |
| 2026-05-19 | 본문 추출은 클라이언트 (서버 fetch 안 함)                               | 봇 차단·로그인 벽 회피                                                                                                                                            |
| 2026-05-19 | provider abstraction 인터페이스만 처음에 + 구현체 1개로 시작            | 과도한 사전 추상화 회피                                                                                                                                           |
| 2026-05-21 | Workers AI 모델 = `@cf/meta/llama-3.1-8b-instruct` 단일 (4개 분석 모두) | S2 spike 5개 모델 비교: term 98%·sensational 93%·quantitative 80%·p95 3s로 균형 최상. 70b가 quant +20%pt 우세하나 term 큰 폭 하락(98→40%)으로 하이브리드도 비추천 |
| 2026-05-21 | Gemini provider 추가 보류                                               | Workers AI 품질 충분 — `qwen1.5-14b`·`gemma-2-9b`는 Cloudflare 측 deprecation/미호스팅으로 호출 불가                                                              |
| 2026-05-21 | `workers-ai.ts`에 `extractText()` 다중 schema 핸들러 추가               | 모델별 응답 schema 차이 (예: llama-3.3-70b는 `{response:{items:[...]}}` 객체 직접 반환)                                                                           |

## 기술 결정

- Manifest V3 익스텐션
- Expo Go + react-native-webview (S1 spike 결과에 따라 EAS bare로 전환 가능)
- pnpm workspace, 공통 패키지 `@newtrospect/core` (본문 추출·API 클라이언트·렌더링 로직 공유)
- API 입출력은 코드포인트 offset 기반 span 좌표계
