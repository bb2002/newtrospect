# newtrospect — 진행상황 (2026-05-19)

> 갱신: 환경 준비물 완료. monorepo 스캐폴딩 + GitHub private repo (bb2002/newtrospect) 푸시 완료. 다음은 spike 3가지.


> 다른 세션에서 이 프로젝트를 이어갈 때 이 문서부터 읽으세요.

## 한 줄 상태

설계 완료(APPROVED), 코드 0줄, **다음 액션은 spike 3가지**.

## 어디까지 왔나

1. ✅ /office-hours 세션으로 아이디어 → 설계 문서까지 완료
2. ✅ 5가지 핵심 전제 검증 통과 (사용자 동의)
3. ✅ 3가지 접근(A 미니멈 / B 풀 비전 / C 일지) 비교 후 **B 채택**
4. ✅ 디자인 문서 v2 보강 (적대적 리뷰 9개 이슈 → 7개 수정 + 2개 의식적 보류)
5. ✅ Status: APPROVED
6. ⬜ 구현 — *spike 후 시작*

## 디자인 문서 위치

```
~/.gstack/projects/newtrospect/ballbot-main-design-20260519-185536.md
```

다음 세션 시작 시 이 문서를 *반드시* 먼저 읽으세요. 모든 의사결정의 근거가 여기 있습니다.

## 다음 액션 (우선순위 순)

### Week 1: 코드 작성 전 spike (총 ~3시간)

**과제 1: 셀렉터 실측 (30분)**
- 매일 보는 한국 뉴스 사이트 5곳 선정
- 각 사이트에서 기사 본문을 정확히 감싸는 DOM 셀렉터를 DevTools로 확인
- 결과를 디자인 문서 "Spike Results" 섹션에 기록
- 출력 예: `news.naver.com: #dic_area (article 태그 X)` 형식

**과제 2: S1 Expo Go WebView spike (2시간)**
- Expo Go 빈 프로젝트 + `react-native-webview` 설정
- 검증 항목 3가지:
  1. `injectedJavaScriptBeforeContentLoaded`로 네이버 뉴스에 JS 인젝션 동작?
  2. SPA 페이지 전환 시 `onNavigationStateChange` 호출됨?
  3. 인젝션된 스크립트에서 cross-origin fetch 가능? (CORS 허용 가정)
- 결과를 "Spike Results"에 기록

**과제 3: S2 Workers AI 한국어 spike (1시간)**
- Cloudflare Workers 계정 + Workers AI 활성화
- 후보 모델 2~3개 (`llama-3.1-8b-instruct`, `qwen1.5-14b-chat-awq`)로 동일 본문 5개 (자극적 표현 다양한 한국 뉴스 본문) 분류 비교
- 주관적으로 "쓸만한가" 판단 (70%+ 정확도 목표)
- 결과를 "Spike Results"에 기록

### Week 2~ (spike 통과 후)

디자인 문서의 "Success Criteria" 타임라인 따라 구현 시작. Week 6에 *본인 1주일 매일 사용* 체크포인트 — 이 신호 없으면 진행 중단하고 재평가.

## 미해결 결정 (다음 세션에서 같이 정할 것들)

- [ ] Workers AI 모델 최종 선택 (S2 결과 후)
- [ ] Gemini 스왑 임계 조건 — 어떤 endpoint를 언제 갈아낄지 (S2 결과 후)
- [x] pnpm workspace 디렉토리 구조 — apps/{extension,mobile,worker} + packages/core
- [x] git repo 초기화 + 원격 호스팅 — GitHub private (https://github.com/bb2002/newtrospect)

## 환경 준비물 (구현 시작 전)

- [x] git init + 초기 커밋 + GitHub private push
- [x] Cloudflare 계정 + Workers/D1 활성화
- [x] Workers AI 베타 액세스 확인
- [x] Google Gemini API 키 준비
- [x] Expo Go 앱 설치된 안드로이드 폰 준비됨
- [x] pnpm 10.33.0 설치됨

## 핵심 트레이드오프 메모

- **B를 택한 이유**: 원안의 풀 비전 (4가지 분석 모두 + 모바일까지)을 유지하면서 확장성 인프라를 처음부터 깔자는 선택. 학습 속도는 A보다 느리지만 한 번에 정확한 방향.
- **A로 강등할 신호**: S1 spike 실패 시 — 모바일을 일단 빼고 익스텐션만 → 사실상 A 모드로 일시 후퇴. *영구 후퇴 아니고 spike 통과까지 보류.*
- **C(일지 대시보드)로 전환할 신호**: Week 6 체크포인트에서 본인이 1주일 매일 안 켰음 — 그러면 "자동 감지 가치"가 약하다는 뜻이라 수동 트리거 + 누적 일지 방향으로 재설계.

## 적대적 리뷰가 강하게 우려한 항목 (인지하고 진행)

1. Expo Go WebView가 실제로 익스텐션 흉내를 낼 수 있는지 (→ S1 spike)
2. Workers AI 한국어 어조 판단 품질 (→ S2 spike)
3. p95 레이턴시 3초 SLA (→ S3 spike — 실측 후 못 지키면 progressive rendering)
4. D1 누적 저장이 현 단계 사용자(본인 1명)에겐 과한 인프라 (→ Phase 1/2 단계화로 완화)
5. provider abstraction 처음부터 (→ 인터페이스만, 구현체는 1개로 시작하기로 완화)
