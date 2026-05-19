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

## 현재 상태 (2026-05-19)

- **Phase**: 설계 완료, 구현 미시작
- **선택된 접근**: Approach B (원안 + 확장성 강화, 1~2개월 예상)
- **디자인 문서**: `~/.gstack/projects/newtrospect/ballbot-main-design-20260519-185536.md` (Status: APPROVED)
- **다음 액션**: STATUS.md의 "다음 액션" 참고

## 다음 세션 시작 가이드

1. 먼저 `STATUS.md` 읽기 — 현재 위치와 다음 액션이 정리되어 있음
2. 그 다음 `~/.gstack/projects/newtrospect/ballbot-main-design-20260519-185536.md` 읽기 — 전체 설계
3. 가장 먼저 해야 할 일은 디자인 문서의 "P0 리스크 — 구현 전 spike 필수" 섹션의 S1·S2·S3 spike
4. spike 결과는 디자인 문서 하단 "Spike Results" 섹션에 추가

## 의사결정 로그

| 일자 | 결정 | 근거 |
|---|---|---|
| 2026-05-19 | Approach B 채택 (원안 풀 비전) | 빌더 모드 + 사용자가 풀 비전 유지 선호 |
| 2026-05-19 | D1 누적 저장 Phase 1(캐시만) / Phase 2(매일 사용 검증 후) 단계화 | YAGNI 리뷰 일부 반영 |
| 2026-05-19 | 캐시 키 = 본문 SHA-256 (URL 아님) | 같은 기사 다른 URL 변종 대응 |
| 2026-05-19 | 본문 추출은 클라이언트 (서버 fetch 안 함) | 봇 차단·로그인 벽 회피 |
| 2026-05-19 | provider abstraction 인터페이스만 처음에 + 구현체 1개로 시작 | 과도한 사전 추상화 회피 |

## 기술 결정

- Manifest V3 익스텐션
- Expo Go + react-native-webview (S1 spike 결과에 따라 EAS bare로 전환 가능)
- pnpm workspace, 공통 패키지 `@newtrospect/core` (본문 추출·API 클라이언트·렌더링 로직 공유)
- API 입출력은 코드포인트 offset 기반 span 좌표계
