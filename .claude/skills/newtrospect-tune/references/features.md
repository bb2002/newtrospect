# newtrospect 튜닝 대상 7기능 — 단일 진실 소스

이 파일은 하네스가 튜닝하는 7개 기능의 정의·gold 기준·평가 metric·API 계약을 정의한다.
`debate-goldset`(정답 작성), `eval-feature`(채점), `tune-prompt`(프롬프트 작성) 스킬이 **모두 이 파일을 참조**한다.
세 스킬이 같은 기준을 보게 하려면 기능 정의를 여기 한 곳에서만 관리한다.

> **출처 주의:** 아래 기준은 *사용자 튜닝 문서*에서 도출한 것이다. `apps/worker/src/prompts.ts` 의
> 기존 프롬프트는 **참고하지 않는다** (사용자 명시 지시). gold·프롬프트는 from scratch 로 작성한다.

## 목차
- [공통 사항 (API 계약·좌표계·데이터 범위)](#공통-사항)
- [F1 detect — 뉴스 판단](#f1-detect)
- [F2 briefing — 사전 지식 3가지](#f2-briefing)
- [F3 sensational — 편파/주관 (빨강)](#f3-sensational)
- [F4 context — 중요 문장 (노랑 bold+밑줄)](#f4-context)
- [F5 term — 어려운 용어 (파랑)](#f5-term)
- [F6 quantitative — 검색 필요 수치 (초록)](#f6-quantitative)
- [F7 oneline — 한 줄 요약](#f7-oneline)
- [제거 대상](#제거-대상)

## 공통 사항

**데이터 흐름 (반드시 숙지):** 서버는 *HTML 이 아니라 클라이언트에서 추출된 본문 평문(text)* 을 받는다.
익스텐션이 `extractArticleText`(사이트 셀렉터 → Readability 폴백)로 평문을 만들고, 다음을 호출한다:
1. `POST /api/detect-article {text, url}` → 뉴스 아니면 종료
2. 뉴스면 4종 분석 + briefing + oneline 을 *text* 로 병렬 호출

따라서 fixture 는 *추출된 본문 text* 이며, 모든 평가는 이 text 를 엔드포인트에 보내 채점한다.
"HTML 을 저장한다"는 사전작업 지시는 **"추출된 본문 text 를 저장한다"로 해석**한다 (2026-05-28 사용자 확정).

**좌표계:** 마킹 기능(F3~F6)의 응답 `spans[]` 는 *코드포인트 offset*(start/end)이다. 하지만 모델은
offset 을 직접 세지 않고 *원문 부분 문자열(substring)* 만 출력하며, 서버 `match-spans.ts` 가 본문 내 매칭으로
좌표를 도출한다. **gold·eval 도 substring/문장 단위로 비교**한다 (offset 정확도가 아니라 "올바른 텍스트를 골랐는가").

**데이터 범위:**
- F1 detect: news + non-news *둘 다* (라벨 분류 정확도).
- F2~F7: *뉴스 데이터만*. news.md 의 모든 뉴스에 대해 목표 정확도를 만족해야 한다.

**모델 제약:** Cloudflare Workers AI 또는 Gemini flash 계열의 *빠른 응답* 모델만 사용.
Workers AI 가용 모델은 https://developers.cloudflare.com/workers-ai/models/ 에서 최신 목록 확인.
(현 wrangler.toml: 일부 `gemini-3.1-pro-preview` 사용 중 — 튜닝하며 flash/Workers AI 로 교체 검토.)

## ⚠️ 전수 평가 강제 규칙 (절대 위반 금지)

수집한 *전체 데이터*를 평가·구현 과정에서 **반드시 다 사용**한다. detect = 전체 **200개**(뉴스 100 + 비뉴스 100),
F2~F7 = 전체 **100개 뉴스**. 예외·면제 없음.

1. **합격 판정은 전체 세트에서만.** /goal 의 pass/fail 점수는 *수집한 전체 세트* 위에서 계산한 값만 유효하다.
   샘플링·일부 추출·"대표 N개"로 낸 점수는 **꼼수이며 무효**다. 어떤 라운드든 부분집합 점수로 합격을 선언할 수 없다.
2. **모든 평가 라운드가 전수.** 중간 디버깅으로 특정 케이스를 들여다보는 것은 허용하되, *그 부분집합으로 점수/합격을
   선언하지 않는다*. 점수가 나오는 호출은 항상 전체 세트.
3. **gold 도 전수.** 비교 기준 gold 는 평가 대상 fixture *전부*에 존재해야 한다(eval 이 전수인데 gold 가 일부면
   비교 불가). F2~F7 은 100개 뉴스 *전부*에 gold 가 있어야 한다.
4. **추출 실패로 세트를 줄이지 말 것.** 추출 실패 fixture 를 조용히 빼서 분모를 줄이는 것도 꼼수다. 추출 실패는 감사에
   *명시*하고, 수집 단계에서 *분석 가능한* URL 로 교체해 최종 세트(뉴스 100 / 총 200)가 전부 사용 가능하게 만든다.
5. **종료 게이트(감사):** 사이클은 각 기능의 **전수 커버리지(evaluated == 수집 수, gold 누락 0)** 가 감사로 확인돼야
   비로소 종료된다. 감사에서 `evaluated < 수집 수` 또는 gold 누락이 있으면 **미종료** — 누락분을 채워 전수 재측정해야
   종료 가능. (오케스트레이터 Phase E 게이트가 강제.)

이 규칙은 사용자 명시 강제 규칙이다(2026-05-28). 속도·비용을 이유로 완화하지 말 것 — 빠른 모델 + worker D1 캐시로
전수 평가가 충분히 가능하다.

---

## F1 detect
- **한국어명:** 뉴스 판단 (기존 '본문인지 판단' 대체)
- **엔드포인트:** `POST /api/detect-article` · 요청 `{text, url?}` · 응답 `{isArticle: boolean, cleanedText, reason?}`
- **데이터:** news.md(정답 isArticle=true) + non-news.md(정답 isArticle=false)
- **gold 기준:** 데이터 라벨 그 자체 (data-collector 가 생성한 news/non-news 분류가 gold). 별도 토론 불필요하나, 라벨 경계 모호 케이스(카테고리 인덱스, RSS, 사진 캡션, 동영상 목록, 회사 안내, 게시판 메인)는 goldset-author 가 재검수.
- **판정 정의:** "이 텍스트가 *단일 뉴스 기사 본문* 인가." 여러 기사 헤드라인 나열·메뉴/네비·모금/정책 문서·갤러리 인덱스 = 비뉴스.
- **metric:** 전체 200개(또는 전체 fixture) accuracy. confusion matrix(TP/FP/TN/FN) 병기.
- **/goal:** accuracy ≥ 95% (전체 대상).
- **eval 도구:** 번들 스크립트 `collect-responses.ts`(FEATURE=detect, SCOPE=both) 로 fixture 응답 수집 → eval-judge 가 라벨과 비교. fixture 는 `build-fixtures.ts` 가 fetch+추출.

## F2 briefing
- **한국어명:** 사전 지식 파악 (본문 위 3장 카드)
- **엔드포인트:** `POST /api/analyze/briefing` · 응답 `{cards: [{title, body} × 정확히 3]}`
- **데이터:** 뉴스만.
- **gold 기준:** "이 뉴스를 읽을 때 *미리 알면 좋을 3가지 객관적 사실*." 본문이 설명하지 않고 전제로 깔고 가는 *외부 배경*(인물/기관 소개, 사건 발단·경위, 정책·제도 개요, 관련 통계/전례, 보도 의의). **본문 문장 paraphrase 금지** — 기사 밖 배경이어야 함. goldset-author 가 codex+opus 로 격렬히 논의해 fixture 별 gold 3사실 작성.
- **metric:** same-context judge — 모델 3카드가 gold 3사실과 *같은 맥락*을 담는가 (judge 가 0~10 점수 + yes/no). 뉴스 fixture 별 pass.
- **/goal:** 같은 맥락 pass rate ≥ 95% (전체 뉴스 대상).

## F3 sensational
- **한국어명:** 편파/주관적 의견 마킹 (빨강)
- **엔드포인트:** `POST /api/analyze/sensational` · 응답 `{spans: [{start,end,kind:"sensational",payload:{reason}}]}` · 모델은 substring(문장) + reason 출력
- **데이터:** 뉴스만.
- **gold 기준:** 본문에서 *편파적(정치적 등)이거나 기자의 주관적 의견*이 들어간 *완결 문장*. 인용된 출처 발언은 제외(기자 본인의 프레이밍만). goldset-author 가 codex+opus 로 논의해 fixture 별 gold 문장 집합 작성.
- **단위:** 완결 문장 (종결어미로 끝남).
- **metric:** gold 대비 recall + ref-validation(judge 가 모델이 추가로 마킹한 문장이 합리적인지 검증). LLM 출력의 합리적 다양성 때문에 recall 단독은 변동 큼 → judge 보정.
- **/goal:** 뉴스 fixture 별 마킹 정확도 ≥ 95% (article pass rate 기준).

## F4 context
- **한국어명:** 중요 문장 마킹 (노랑, bold+밑줄)
- **엔드포인트:** `POST /api/analyze/context` · 응답 `{spans: [{...,kind:"context",payload:{}}]}` · 모델은 substring(문장) 출력
- **데이터:** 뉴스만.
- **gold 기준:** "*이 문장만 읽으면 전체적인 맥락을 파악*할 수 있는 중요한 문장." 원인→결과→결론 흐름을 복원하는 최소 핵심 문장(보통 2~4개). goldset-author 가 논의해 fixture 별 gold 작성.
- **단위:** 완결 문장.
- **metric:** "본문 핵심 cover" judge — 모델이 고른 문장들만 읽어도 기사 핵심 맥락이 복원되는가 (단일 yes/no + 점수).
- **/goal:** cover pass rate ≥ 95% (전체 뉴스 대상).

## F5 term
- **한국어명:** 어려운 용어 마킹 (파랑)
- **엔드포인트:** `POST /api/analyze/terms` · 응답 `{spans: [{...,kind:"term",payload:{explanation}}]}` · 모델은 단어/명사구 + explanation 출력
- **데이터:** 뉴스만.
- **gold 기준:** *특정 도메인 지식이 필요*하거나 *한국 중학교 교육과정 이수자가 이해하기 어려운* 단어. 일상어·일반 인명/기관명/단순 지명 제외. 본문이 직접 풀어 설명한 단어 제외. goldset-author 가 논의해 fixture 별 gold 용어 집합 작성.
- **단위:** 단어 또는 짧은 명사구.
- **metric:** marking-quality judge — 모델이 고른 용어가 "중학생 기준 어려운 용어" 정의에 부합하는가 + 핵심 누락 없는가 (점수 + yes/no).
- **/goal:** 마킹 품질 pass rate ≥ 95% (전체 뉴스 대상).

## F6 quantitative
- **한국어명:** 검색 필요 수치 마킹 (초록)
- **엔드포인트:** `POST /api/analyze/quantitative` · 응답 `{spans: [{...,kind:"quantitative",payload:{searchQuery}}]}` · 모델은 수치 표현 + searchQuery 출력
- **데이터:** 뉴스만.
- **gold 기준:** *문맥상 중요한 수치이면서 검증(검색)이 필요하다고 판단되는 값*. 단순 보도 날짜/시각 제외, 단 주장 검증에 필요한 기간/시행연도는 포함. goldset-author 가 논의해 fixture 별 gold 수치 집합 작성.
- **단위:** 수치/금액/비율/식별자 등 단어 또는 짧은 구.
- **metric:** marking-quality judge — 고른 수치가 "검색 필요·문맥 중요" 정의에 부합 + searchQuery 합리성 + 핵심 누락 없음.
- **/goal:** 마킹 품질 pass rate ≥ 95% (전체 뉴스 대상).

## F7 oneline
- **한국어명:** 한 줄 요약
- **엔드포인트:** `POST /api/analyze/oneline` · 응답 `{oneLine: string}`
- **데이터:** 뉴스만.
- **gold 기준:** 이 뉴스를 *한 줄 또는 두 줄로* 요약한 핵심. goldset-author 가 논의해 fixture 별 gold 요약 작성.
- **metric:** same-context judge — 모델 요약이 gold 요약과 *같은 맥락*(핵심 사건·주체·결과 일치)인가.
- **/goal:** 같은 맥락 pass rate ≥ 95% (전체 뉴스 대상).

---

## 제거 대상
- **`rewrite_sensational`** (자극→온화 변환): 기획에서 제거. 다음을 *모두* 제거해야 함 —
  worker 엔드포인트 `POST /api/rewrite/sensational` + 핸들러 + `REWRITE_SENSATIONAL_PROMPT`,
  core `client.ts` 의 `rewriteSensational` + `REWRITE_SENSATIONAL_ENDPOINT` + 관련 타입,
  extension/mobile popover 의 '온화한 표현으로 보기' 버튼.
  - **주의:** popover *클릭 메커니즘 자체*는 유지 — CLAUDE.md 의 "context 하이라이트 click 4중 방어" 회귀 금지.
  env.ts/wrangler.toml 의 `*_REWRITE` 변수도 정리. 제거 후 api-qa 가 경계면 점검.
- **`character`** (글 성격 7신호, specs/04): 이번 튜닝 문서 *범위 밖*. 건드리지 않는다 (그대로 둠).
