# Eval 3-articles [round3] — 2026-05-22T01:16:20.693Z

Worker: http://127.0.0.1:8787
Articles: 3 × Kinds: 4 = 12 calls

---

## b1-clickhouse — ClickHouse 쿼리 플랜 잠금 경합
- Source: Cloudflare Blog (한국어)
- Body: 2086 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1347ms
- matched=3/4 (recall 75%) · api=4 (precision 75%)
- matched:
  - REF `샘플링된 CPU 시간의 45%가 filterPartsByPartition이라는 단일 함수에서 사용되고 있었습니다.` ↔ API `샘플링된 CPU 시간의 45%가 filterPartsByPartition이라는 단일 함수에서 사용되고 있었습니다.`
  - REF `문제는 CPU 위주의 작업이 아니었습니다.` ↔ API `문제는 CPU 위주의 작업이 아니었습니다. 바로 대규모 잠금 경합이었습니다.`
  - REF `2026년 3월에 이 패치를 배포한 후 쿼리 지속 시간이 50% 감소했습니다.` ↔ API `2026년 3월에 이 패치를 배포한 후 쿼리 지속 시간이 50% 감소했습니다.`
- missed (정답에 있는데 API 가 못 뽑음):
  - Cloudflare의 청구서가 나가는 것을 담당하는 ClickHouse의 일일 집계 작업이 마이그레이션 후에 크게 느려졌을 때 큰 문제가 되었던 이유가 바로 그것입니다.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 쿼리 플래너는 부품 목록을 수정하지 않습니다. 그냥 읽습니다. 대신 공유 잠금을 획득하도록 코드를 수정했습니다. 이를 통해 모든 쿼리 플래너가 중요 섹션에 동시에 진입할 수 있었습…

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 1056ms
- matched=1/1 (recall 100%) · api=2 (precision 50%)
- matched:
  - REF `하지만 여기에는 보존 정책이라는 치명적인 결함이 있었습니다.` ↔ API `하지만 여기에는 보존 정책이라는 치명적인 결함이 있었습니다.`
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 모든 작업이 하나의 파일 줄에 서 있었습니다.

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 1971ms
- matched=9/10 (recall 90%) · api=10 (precision 90%)
- matched:
  - REF `OLAP` ↔ API `OLAP`
  - REF `TTL` ↔ API `TTL`
  - REF `뮤텍스` ↔ API `뮤텍스`
  - REF `공유 잠금` ↔ API `공유 잠금`
  - REF `플레임 그래프` ↔ API `플레임 그래프`
  - REF `trace_log` ↔ API `trace_log`
  - REF `잠금 경합` ↔ API `잠금 경합`
  - REF `최대-최소 공정성 알고리즘` ↔ API `최대-최소 공정성 알고리즘`
  - REF `네임스페이스` ↔ API `네임스페이스`
- missed (정답에 있는데 API 가 못 뽑음):
  - 바이너리 검색
- extra (정답에 없는데 API 가 추가로 뽑음):
  - PR

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 1763ms
- matched=10/10 (recall 100%) · api=10 (precision 100%)
- matched:
  - REF `100페타바이트 이상의 데이터` ↔ API `100페타바이트 이상`
  - REF `2PiB 이상의 데이터` ↔ API `2PiB 이상`
  - REF `31일 이상 된 파티션` ↔ API `31일 이상`
  - REF `90%` ↔ API `90%`
  - REF `45%` ↔ API `45%`
  - REF `50% 감소` ↔ API `50% 감소`
  - REF `30,000개` ↔ API `30,000개`
  - REF `160,000개` ↔ API `160,000개의 부품`
  - REF `ClickHouse 버전 25.11` ↔ API `ClickHouse 버전 25.11`
  - REF `PR #85535` ↔ API `PR #85535`

---

## b2-tumen — 호르무즈 막히자 두만강 열려는 중국
- Source: 서울경제 (페트로-일렉트로)
- Body: 1757 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1274ms
- matched=2/3 (recall 67%) · api=3 (precision 67%)
- matched:
  - REF `중국이 두만강을 주목하는 이유가 바로 에너지 수입 다변화를 통한 에너지 안보 강화인 셈입니다.` ↔ API `중국이 두만강을 주목하는 이유가 바로 에너지 수입 다변화를 통한 에너지 안보 강화인 셈입니다.`
  - REF `가능성과 장애물이 공존하는 만큼, 북중러가 이번에 두만강 문제에서 얼마나 실질적인 합의를 이룰 수 있을지는 좀 더 지켜봐야 할 문제입니다.` ↔ API `가능성과 장애물이 공존하는 만큼, 북중러가 이번에 두만강 문제에서 얼마나 실질적인 합의를 이룰 수 있을지는 좀 더 지켜봐야 할 문제입니다.`
- missed (정답에 있는데 API 가 못 뽑음):
  - 바로 중국과 러시아가 북한 두만강을 통한 '동해 진출' 문제에 대해 전방위 협력을 확대한다는 것인데요.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 두만강 출구와 동해 항만 연결망이 구축될 경우, 예를 들어 시베리아에서 북극항로를 거쳐 두만강 하구에 세워진 물동항을 통해 러시아산 액화천연가스(LNG)를 중국 본토로 들여올 수 …

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 1278ms
- matched=3/3 (recall 100%) · api=3 (precision 100%)
- matched:
  - REF `이에 대해 미국은 해상 봉쇄라는 역조치로 호르무즈 해협을 한 마디로 이중으로 막고 있는 형국이고요.` ↔ API `이에 대해 미국은 해상 봉쇄라는 역조치로 호르무즈 해협을 한 마디로 이중으로 막고 있는 형국이고요.`
  - REF `중국은 두만강을 새로운 북방 에너지 동맥으로 만들려 하고 있지만, 러시아와 북한 역시 협조와 경계를 동시에 이어가고 있습니다.` ↔ API `중국은 두만강을 새로운 북방 에너지 동맥으로 만들려 하고 있지만, 러시아와 북한 역시 협조와 경계를 동시에 이어가고 있습니다.`
  - REF `러시아로서는 세계 최대 LNG 수입국인 중국이라는 새로운 '큰 손'을 반드시 포섭해야 하는 상황인 겁니다.` ↔ API `러시아로서는 세계 최대 LNG 수입국인 중국이라는 새로운 '큰 손'을 반드시 포섭해야 하는 상황인 겁니다.`

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 2511ms
- matched=5/6 (recall 83%) · api=8 (precision 63%)
- matched:
  - REF `호르무즈 해협` ↔ API `호르무즈 해협`
  - REF `믈라카 해협` ↔ API `믈라카 해협`
  - REF `북극항로` ↔ API `북극항로`
  - REF `액화천연가스(LNG)` ↔ API `LNG`
  - REF `초크 포인트` ↔ API `초크 포인트`
- missed (정답에 있는데 API 가 못 뽑음):
  - 안정화 전원
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 파나마 운하
  - 수에즈 운하
  - EU

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 1410ms
- matched=6/6 (recall 100%) · api=6 (precision 100%)
- matched:
  - REF `20개 분야에 대한 경제 협력` ↔ API `20개 분야`
  - REF `약 1만 8000㎞ 길이의 해안선` ↔ API `약 1만 8000㎞`
  - REF `70~80%` ↔ API `70~80%`
  - REF `최대 90%` ↔ API `최대 90%`
  - REF `50%를 차지하는 중동산 에너지` ↔ API `50%`
  - REF `총 최대 2800㎞` ↔ API `총 최대 2800㎞`

---

## b3-samsung-tax — 삼성전자 성과급 6억 실수령액
- Source: 서울신문
- Body: 700 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1202ms
- matched=3/3 (recall 100%) · api=3 (precision 100%)
- matched:
  - REF `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.` ↔ API `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.`
  - REF `시뮬레이션 결과 이 직원은 총 2억 4719만원을 근로소득세로 내야 하는 것으로 나타났다.` ↔ API `시뮬레이션 결과 이 직원은 총 2억 4719만원을 근로소득세로 내야 하는 것으로 나타났다.`
  - REF `근로소득세에 10%가 붙는 지방소득세를 빼면 실수령액은 4억 2000만원대로 추정된다.` ↔ API `근로소득세에 10%가 붙는 지방소득세를 빼면 실수령액은 4억 2000만원대로 추정된다.`

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 962ms
- matched=1/1 (recall 100%) · api=1 (precision 100%)
- matched:
  - REF `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.` ↔ API `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.`

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 2008ms
- matched=7/9 (recall 78%) · api=7 (precision 100%)
- matched:
  - REF `특별경영성과급` ↔ API `특별경영성과급`
  - REF `자사주` ↔ API `자사주`
  - REF `원천징수` ↔ API `원천징수`
  - REF `근로소득공제` ↔ API `근로소득공제`
  - REF `인적공제` ↔ API `인적공제`
  - REF `과세표준` ↔ API `과세표준`
  - REF `DS` ↔ API `DS`
- missed (정답에 있는데 API 가 못 뽑음):
  - 근로소득세
  - 지방소득세

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 2383ms
- matched=13/13 (recall 100%) · api=15 (precision 87%)
- matched:
  - REF `사업성과의 10%대` ↔ API `10%대`
  - REF `최대 6억원가량` ↔ API `최대 6억원`
  - REF `연봉 1억원` ↔ API `연봉 1억원`
  - REF `2억 4719만원` ↔ API `2억 4719만원`
  - REF `4억 2000만원대` ↔ API `4억 2000만원대`
  - REF `총급여 7억원` ↔ API `총급여 7억원`
  - REF `근로소득공제(2000만원)` ↔ API `근로소득공제(2000만원)`
  - REF `인적공제(450만원)` ↔ API `인적공제(450만원)`
  - REF `과세표준은 6억 7550만원` ↔ API `6억 7550만원`
  - REF `근로소득세율 42%` ↔ API `근로소득세율 42%`
  - REF `2억 7000만원대` ↔ API `2억 7000만원대`
  - REF `2억 6000여만원` ↔ API `2억 6000여만원`
  - REF `700만~800만원` ↔ API `700만~800만원`
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 4억원대
  - 3인 가족

---

## Aggregate by kind

| kind | ref | api | matched | precision | recall | F1 |
|---|---|---|---|---|---|---|
| 🟡 context | 10 | 10 | 8 | 80% | 80% | 0.80 |
| 🔴 sensational | 5 | 6 | 5 | 83% | 100% | 0.91 |
| 🔵 term | 25 | 25 | 21 | 84% | 84% | 0.84 |
| 🟢 quantitative | 29 | 31 | 29 | 94% | 100% | 0.97 |

## Per-article matched/recall

| article | 🟡 context | 🔴 sensational | 🔵 term | 🟢 quantitative |
|---|---|---|---|---|
| b1-clickhouse | 3/4 (api 4) | 1/1 (api 2) | 9/10 (api 10) | 10/10 (api 10) |
| b2-tumen | 2/3 (api 3) | 3/3 (api 3) | 5/6 (api 8) | 6/6 (api 6) |
| b3-samsung-tax | 3/3 (api 3) | 1/1 (api 1) | 7/9 (api 7) | 13/13 (api 15) |