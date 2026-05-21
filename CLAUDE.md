# newtrospect 프로젝트

## 주의 사항

- 한국어로 대화 할 것

## 프로젝트 개요

newtrospect = AI 기반 비판적 뉴스 읽기 보조 도구.
브라우저 익스텐션(Chrome/Firefox) + 안드로이드 앱(Expo Go WebView)이 한국 뉴스 사이트의 본문을 자동 감지하고 4가지 분석을 인라인 하이라이트로 보여줌:
- 파랑: 어려운 용어 + 문맥 기반 설명 (모달)
- 빨강: 자극적/선동적 표현 (툴팁 경고)
- 초록: 수치/정량 표현 (Google 검색 버튼)
- 노랑: 핵심 문맥 문장 (시각 표시만)

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

| 일자 | 결정 | 근거 |
|---|---|---|
| 2026-05-19 | Approach B 채택 (원안 풀 비전) | 빌더 모드 + 사용자가 풀 비전 유지 선호 |
| 2026-05-19 | D1 누적 저장 Phase 1(캐시만) / Phase 2(매일 사용 검증 후) 단계화 | YAGNI 리뷰 일부 반영 |
| 2026-05-19 | 캐시 키 = 본문 SHA-256 (URL 아님) | 같은 기사 다른 URL 변종 대응 |
| 2026-05-19 | 본문 추출은 클라이언트 (서버 fetch 안 함) | 봇 차단·로그인 벽 회피 |
| 2026-05-19 | provider abstraction 인터페이스만 처음에 + 구현체 1개로 시작 | 과도한 사전 추상화 회피 |
| 2026-05-21 | Workers AI 모델 = `@cf/meta/llama-3.1-8b-instruct` 단일 (4개 분석 모두) | S2 spike 5개 모델 비교: term 98%·sensational 93%·quantitative 80%·p95 3s로 균형 최상. 70b가 quant +20%pt 우세하나 term 큰 폭 하락(98→40%)으로 하이브리드도 비추천 |
| 2026-05-21 | Gemini provider 추가 보류 | Workers AI 품질 충분 — `qwen1.5-14b`·`gemma-2-9b`는 Cloudflare 측 deprecation/미호스팅으로 호출 불가 |
| 2026-05-21 | `workers-ai.ts`에 `extractText()` 다중 schema 핸들러 추가 | 모델별 응답 schema 차이 (예: llama-3.3-70b는 `{response:{items:[...]}}` 객체 직접 반환) |

## 기술 결정

- Manifest V3 익스텐션
- Expo Go + react-native-webview (S1 spike 결과에 따라 EAS bare로 전환 가능)
- pnpm workspace, 공통 패키지 `@newtrospect/core` (본문 추출·API 클라이언트·렌더링 로직 공유)
- API 입출력은 코드포인트 offset 기반 span 좌표계
