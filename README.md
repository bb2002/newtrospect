# newtrospect

AI 기반 비판적 뉴스 읽기 보조 도구. 한국 뉴스 사이트의 본문을 자동 감지해 4가지 분석을 인라인 하이라이트로 보여줍니다.

- 🔵 **파랑** — 어려운 용어 + 문맥 기반 설명 (모달)
- 🔴 **빨강** — 자극적/선동적 표현 (툴팁 경고)
- 🟢 **초록** — 수치/정량 표현 (Google 검색 버튼)
- 🟡 **노랑** — 핵심 문맥 문장 (시각 표시만)

## 구조

```
apps/
  extension/   Manifest V3 브라우저 익스텐션 (Chrome/Firefox)
  mobile/      Expo Go + react-native-webview 안드로이드 앱
  worker/      Cloudflare Workers + Workers AI + D1
packages/
  core/        @newtrospect/core — 본문 추출 · API 클라이언트 · 렌더링 로직 공용
```

## 현재 상태

설계 완료(APPROVED) · 구현 미시작 · 다음 액션은 Week 1 spike 3가지.
자세한 진행상황은 [`STATUS.md`](./STATUS.md) 참고.

## 요구사항

- Node.js ≥ 20
- pnpm ≥ 10
- Cloudflare 계정 + Workers AI 활성화
- Expo Go 설치된 안드로이드 폰 (S1 spike용)
