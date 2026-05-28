---
name: eval-feature
description: newtrospect 기능별 정확도를 측정한다. fixture를 worker 엔드포인트에 호출해 gold와 비교하고 accuracy/recall/same-context를 LLM judge로 채점, 실패 케이스를 리포트한다. "정확도 측정", "eval 실행", "채점", "confusion matrix", "/goal 도달 확인" 요청 시 사용.
---

# 기능 평가 / 채점

prompt-tuner 의 결과를 *독립적으로* 채점한다. fixture 추출 text 를 실제 worker 엔드포인트에 보내(프로덕션 경로)
gold 와 비교한다. 기능 정의·metric·goal 은 `.claude/skills/newtrospect-tune/references/features.md` 를 따른다.

## 절차

1. **응답 수집(결정적):** 번들 스크립트로 엔드포인트 호출 결과를 모은다.
   ```bash
   cd apps/worker   # worker dev 가 떠 있어야 함
   FEATURE=sensational pnpm tsx ../../.claude/skills/eval-feature/scripts/collect-responses.ts
   ```
   → `_workspace/eval/<feature>/responses.json`. `FEATURE` 값: detect|terms|sensational|quantitative|context|briefing|oneline.
2. **채점:** 기능 metric 에 맞게 gold(`_workspace/gold/<feature>/`)와 응답을 비교. 주관 metric 은 **2-judge 합의**로 채점(아래 "judge 신뢰도").
3. **전수 평가 강제:** /goal 은 *수집 전체* 기준. collect-responses.ts 는 서브샘플링이 없어 항상 전수 호출하고
   coverage 를 출력한다. coverage<100%(추출 실패 등)면 합격 불가 — 감사에 명시하고 수집 교체 후 재측정. (features.md 전수 규칙)
4. **리포트:** `_workspace/eval/<feature>/round-N.json` + `report.md`. 합격 시 `PASS.md`.

## 기능별 metric

| 기능 | metric | 합격선 |
|------|--------|--------|
| F1 detect | accuracy + confusion matrix(TP/FP/TN/FN). 추출 실패 fixture = 비뉴스 예측 등가. | accuracy ≥ 95% (전체 200) |
| F3 sensational | gold recall + ref-validation(모델 추가 마킹의 합리성 judge) | article pass rate ≥ 95% |
| F4 context | "본문 핵심 cover" judge (고른 문장만 읽어 맥락 복원되나) | cover pass rate ≥ 95% |
| F5 term | marking-quality judge (중학생 기준 어려운 용어 부합 + 핵심 누락) | pass rate ≥ 95% |
| F6 quantitative | marking-quality judge (검색 필요·문맥 중요 + searchQuery 합리성) | pass rate ≥ 95% |
| F2 briefing | same-context judge (3카드 vs gold 3사실 같은 맥락) | pass rate ≥ 95% |
| F7 oneline | same-context judge (요약 vs gold 같은 핵심) | pass rate ≥ 95% |

> **pass rate 계산:** 뉴스 fixture 각각을 judge 가 pass/fail 로 판정 → pass 비율. 마킹 기능은 fixture 단위로
> "이 기사 마킹이 합격인가"를 본다(개별 span 정확도의 평균이 아니라 *기사 단위 합격률*). 사용자: "대상 데이터 전체가 95%".

## judge 프롬프트 골격 (Gemini flash)

judge 에는 *본문 + gold + 모델 출력* 을 함께 주고 JSON 으로 받는다. 예(same-context, F2/F7):
```
다음은 뉴스 본문, 기준 정답(gold), 모델 출력이다. 모델 출력이 gold 와 *같은 핵심 맥락*을 담는지 판정하라.
누락/왜곡/과장이 있으면 fail. 출력: {"pass": true|false, "score": 0~10, "reason": "<한 줄>"}
[본문] ... [gold] ... [모델 출력] ...
```
marking-quality(F5/F6)·cover(F4)·ref-validation(F3)도 동형: 정의 부합 + 핵심 누락 + 오탐을 묻고 `{pass,score,reason}` 반환.
judge 도 *빠른 모델*을 쓰고 temperature 낮게(0~0.2). 파싱 실패 시 재호출.

## judge 신뢰도 (2-judge 합의 + 캘리브레이션)

LLM judge 1개의 판정은 흔들린다. 주관 metric(F2·F4·F5·F6·F7)은 다음으로 신뢰도를 높인다:
1. **캘리브레이션 (채점 전 1회):** judge 에게 *명백한 정답*(gold 그대로 = pass 여야 함)과 *명백한 오답*
   (gold 와 무관/왜곡 = fail 여야 함) 케이스를 먼저 통과시켜 둘을 옳게 가르는지 확인한다. 못 가르면 judge 프롬프트를
   고치고 재캘리브레이션. **캘리브레이션을 통과한 judge 만** 본 채점에 쓴다(judge 자체를 신뢰하기 전에 검증).
2. **2-judge 합의:** 각 fixture 를 서로 다른 빠른 모델(예: `gemini-flash-latest` + 다른 flash/Workers AI) 또는 동일
   모델의 *프롬프트 변형 2개*로 각각 채점한다.
   - 둘 다 pass → pass, 둘 다 fail → fail (확정).
   - 불일치 → 3차 tie-break judge 또는 *본문 근거*로 재판단. 그래도 모호하면 goldset-author 에 재검토 요청 +
     해당 케이스 **"보류"**로 표기(임의 pass 처리 금지 — pass rate 분모에는 남긴다).
3. **agreement rate 기록:** 두 judge 일치율을 리포트에 남긴다. <85% 면 gold 기준 또는 judge 프롬프트가 모호하다는
   신호 — metric/gold 자체를 점검한다.
4. judge 도 *빠른 모델*, temperature 0~0.2. **F1 detect 는 객관 라벨이라 judge 불필요**(라벨 직접 비교).

## 채점 독립성 (중요)

- 채점은 prompt-tuner 와 분리돼야 공정하다. 프롬프트를 보고 "맞춰주는" 채점 금지.
- gold 가 모호/오류로 의심되면 *근거와 함께* goldset-author 에 재검토 요청 — 점수를 임의로 조정하지 않는다.
- 회귀(직전 라운드 대비 점수 하락)는 리포트에 명확히 경고한다.

## 버전 태깅 / 회귀 추적

- 사이클마다 오케스트레이터가 `runTag`(예: `20260528-1530` 또는 `v3`)를 부여한다. eval 산출물은
  `_workspace/eval/<feature>/<runTag>/round-N.json`·`report.md`·`PASS.md` 로 **버전별 보존**한다.
- **history 누적:** 기능별 최종 결과를 `_workspace/history.jsonl` 에 한 줄씩 append —
  `{runTag, feature, metric, score, passRate, coverage, model, promptVersion, ts}`.
- **회귀 경보:** 새 runTag 측정 시 *직전 runTag* 의 같은 기능 score 와 비교해 하락하면 리포트 상단에
  `⚠️ 회귀: F5 96%→92%` 처럼 명시. 라운드 내 회귀(직전 라운드 대비 하락)도 동일하게 경고.
- **diff:** 실패 케이스 집합도 runTag 간 비교해 *새로 깨진 케이스* / *새로 고쳐진 케이스* 를 구분하면 원인 추적이 쉽다.

## detect 특수 처리

익스텐션 동작과 같은 논리: 추출 실패/too_short fixture 는 익스텐션이 분석을 건너뛰므로 *비뉴스 예측과 등가*로
집계한다. 따라서 collect-responses.ts 는 detect 에서 추출 실패 fixture 도 포함한다.
