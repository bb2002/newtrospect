# Eval 3-articles [baseline] — 2026-05-22T01:02:31.718Z

Worker: http://127.0.0.1:8787
Articles: 3 × Kinds: 4 = 12 calls

---

## b1-clickhouse — ClickHouse 쿼리 플랜 잠금 경합
- Source: Cloudflare Blog (한국어)
- Body: 2086 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1474ms
- matched=2/4 (recall 50%) · api=4 (precision 50%)
- matched:
  - REF `Cloudflare의 청구서가 나가는 것을 담당하는 ClickHouse의 일일 집계 작업이 마이그레이션 후에 크게 느려졌을 때 큰 문제가 되었던…` ↔ API `Cloudflare의 청구서가 나가는 것을 담당하는 ClickHouse의 일일 집계 작업이 마이그레이션 후에 크게 느려졌을 때 큰 문제가 되었던…`
  - REF `2026년 3월에 이 패치를 배포한 후 쿼리 지속 시간이 50% 감소했습니다.` ↔ API `파티션 ID의 네임스페이스 부분을 기반으로 바이너리 검색을 구현했습니다. 2026년 3월에 이 패치를 배포한 후 쿼리 지속 시간이 50% 감소했…`
- missed (정답에 있는데 API 가 못 뽑음):
  - 샘플링된 CPU 시간의 45%가 filterPartsByPartition이라는 단일 함수에서 사용되고 있었습니다.
  - 문제는 CPU 위주의 작업이 아니었습니다.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 쿼리 지속 시간의 절반 이상이 테이블의 부분 목록을 보호하는 단일 뮤텍스를 획득하기 위해 대기하는 데 사용되었습니다.
  - 쿼리 플래너는 부품 목록을 수정하지 않습니다. 그냥 읽습니다. 대신 공유 잠금을 획득하도록 코드를 수정했습니다.

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 1300ms
- matched=1/1 (recall 100%) · api=1 (precision 100%)
- matched:
  - REF `치명적인 결함이 있었습니다` ↔ API `하지만 여기에는 보존 정책이라는 치명적인 결함이 있었습니다.`

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 1915ms
- matched=3/10 (recall 30%) · api=7 (precision 43%)
- matched:
  - REF `OLAP` ↔ API `OLAP`
  - REF `뮤텍스` ↔ API `뮤텍스`
  - REF `잠금 경합` ↔ API `잠금 경합`
- missed (정답에 있는데 API 가 못 뽑음):
  - TTL
  - 공유 잠금
  - 플레임 그래프
  - trace_log
  - 최대-최소 공정성 알고리즘
  - 바이너리 검색
  - 네임스페이스
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 다운스트림
  - I/O
  - 파티셔닝
  - PR

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 1604ms
- matched=8/10 (recall 80%) · api=8 (precision 100%)
- matched:
  - REF `100페타바이트 이상의 데이터` ↔ API `100페타바이트 이상의 데이터`
  - REF `2PiB 이상의 데이터` ↔ API `2PiB 이상의 데이터`
  - REF `31일 이상 된 파티션` ↔ API `31일 이상 된 파티션`
  - REF `90%` ↔ API `목표 디스크 사용률(예: 90%)`
  - REF `45%` ↔ API `샘플링된 CPU 시간의 45%`
  - REF `50% 감소` ↔ API `쿼리 지속 시간이 50% 감소`
  - REF `30,000개` ↔ API `복제본당 부품 개수는 30,000개`
  - REF `160,000개` ↔ API `복제본당 160,000개의 부품`
- missed (정답에 있는데 API 가 못 뽑음):
  - ClickHouse 버전 25.11
  - PR #85535

---

## b2-tumen — 호르무즈 막히자 두만강 열려는 중국
- Source: 서울경제 (페트로-일렉트로)
- Body: 1757 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1032ms
- matched=2/3 (recall 67%) · api=3 (precision 67%)
- matched:
  - REF `바로 중국과 러시아가 북한 두만강을 통한 '동해 진출' 문제에 대해 전방위 협력을 확대한다는 것인데요.` ↔ API `바로 중국과 러시아가 북한 두만강을 통한 '동해 진출' 문제에 대해 전방위 협력을 확대한다는 것인데요.`
  - REF `중국이 두만강을 주목하는 이유가 바로 에너지 수입 다변화를 통한 에너지 안보 강화인 셈입니다.` ↔ API `중국이 두만강을 주목하는 이유가 바로 에너지 수입 다변화를 통한 에너지 안보 강화인 셈입니다.`
- missed (정답에 있는데 API 가 못 뽑음):
  - 가능성과 장애물이 공존하는 만큼, 북중러가 이번에 두만강 문제에서 얼마나 실질적인 합의를 이룰 수 있을지는 좀 더 지켜봐야 할 문제입니다.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 시진핑 중국 국가주석이 이달 20일(현지 시간) 블라디미르 푸틴 러시아 대통령을 베이징으로 초청해 중러 '밀착'을 과시했습니다.

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 1065ms
- matched=0/3 (recall 0%) · api=2 (precision 0%)
- missed (정답에 있는데 API 가 못 뽑음):
  - 이에 대해 미국은 해상 봉쇄라는 역조치로 호르무즈 해협을 한 마디로 이중으로 막고 있는 형국이고요.
  - 중국은 두만강을 새로운 북방 에너지 동맥으로 만들려 하고 있지만, 러시아와 북한 역시 협조와 경계를 동시에 이어가고 있습니다.
  - 러시아로서는 세계 최대 LNG 수입국인 중국이라는 새로운 '큰 손'을 반드시 포섭해야 하는 상황인 겁니다.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 호르무즈 해협은 현재 미국·이란 전쟁으로 거의 봉쇄된 상태죠.
  - 중국으로서는 에너지 초크 포인트를 장악해가는 미국이 매우 신경 쓰일 수밖에 없겠죠.

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 1581ms
- matched=3/6 (recall 50%) · api=5 (precision 60%)
- matched:
  - REF `액화천연가스(LNG)` ↔ API `액화천연가스(LNG)`
  - REF `초크 포인트` ↔ API `초크 포인트`
  - REF `안정화 전원` ↔ API `안정화 전원`
- missed (정답에 있는데 API 가 못 뽑음):
  - 호르무즈 해협
  - 믈라카 해협
  - 북극항로
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 지정학
  - 해상 병목

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 1198ms
- matched=6/6 (recall 100%) · api=6 (precision 100%)
- matched:
  - REF `20개 분야에 대한 경제 협력` ↔ API `20개 분야`
  - REF `약 1만 8000㎞ 길이의 해안선` ↔ API `약 1만 8000㎞`
  - REF `70~80%` ↔ API `70~80%`
  - REF `최대 90%` ↔ API `최대 90%`
  - REF `50%를 차지하는 중동산 에너지` ↔ API `50%를 차지하는`
  - REF `총 최대 2800㎞` ↔ API `최대 2800㎞`

---

## b3-samsung-tax — 삼성전자 성과급 6억 실수령액
- Source: 서울신문
- Body: 700 codepoints

### 🟡 context
- model: gemini-3.1-flash-lite-preview, 1041ms
- matched=2/3 (recall 67%) · api=3 (precision 67%)
- matched:
  - REF `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.` ↔ API `삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.`
  - REF `시뮬레이션 결과 이 직원은 총 2억 4719만원을 근로소득세로 내야 하는 것으로 나타났다.` ↔ API `시뮬레이션 결과 이 직원은 총 2억 4719만원을 근로소득세로 내야 하는 것으로 나타났다.`
- missed (정답에 있는데 API 가 못 뽑음):
  - 근로소득세에 10%가 붙는 지방소득세를 빼면 실수령액은 4억 2000만원대로 추정된다.
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 이에 따라 반도체(DS) 부문 임직원은 올해 최대 6억원가량(세전, 연봉 1억원 기준)의 성과급을 받을 것이라는 추정이 나오는 가운데 이 경우 실수령액은 약 4억원대인 것으로 분석…

### 🔴 sensational
- model: gemini-3.1-flash-lite-preview, 1086ms
- matched=0/1 (recall 0%) · api=0 (precision 0%)
- missed (정답에 있는데 API 가 못 뽑음):
  - 삼성전자 노사가 사업성과의 10%대를 성과급 재원으로 고정하는 파격적 보상안에 합의했다.

### 🔵 term
- model: gemini-3.1-flash-lite-preview, 1508ms
- matched=6/9 (recall 67%) · api=6 (precision 100%)
- matched:
  - REF `근로소득세` ↔ API `근로소득세`
  - REF `원천징수` ↔ API `원천징수`
  - REF `근로소득공제` ↔ API `근로소득공제`
  - REF `인적공제` ↔ API `인적공제`
  - REF `과세표준` ↔ API `과세표준`
  - REF `DS` ↔ API `DS`
- missed (정답에 있는데 API 가 못 뽑음):
  - 특별경영성과급
  - 자사주
  - 지방소득세

### 🟢 quantitative
- model: gemini-3.1-flash-lite-preview, 2401ms
- matched=12/13 (recall 92%) · api=14 (precision 86%)
- matched:
  - REF `사업성과의 10%대` ↔ API `10%대`
  - REF `최대 6억원가량` ↔ API `최대 6억원`
  - REF `2억 4719만원` ↔ API `2억 4719만원`
  - REF `4억 2000만원대` ↔ API `4억 2000만원대`
  - REF `총급여 7억원` ↔ API `7억원`
  - REF `근로소득공제(2000만원)` ↔ API `2000만원`
  - REF `인적공제(450만원)` ↔ API `450만원`
  - REF `과세표준은 6억 7550만원` ↔ API `6억 7550만원`
  - REF `근로소득세율 42%` ↔ API `42%`
  - REF `2억 7000만원대` ↔ API `2억 7000만원대`
  - REF `2억 6000여만원` ↔ API `2억 6000여만원`
  - REF `700만~800만원` ↔ API `700만~800만원`
- missed (정답에 있는데 API 가 못 뽑음):
  - 연봉 1억원
- extra (정답에 없는데 API 가 추가로 뽑음):
  - 4억원대
  - 150만원

---

## Aggregate by kind

| kind | ref | api | matched | precision | recall | F1 |
|---|---|---|---|---|---|---|
| 🟡 context | 10 | 10 | 6 | 60% | 60% | 0.60 |
| 🔴 sensational | 5 | 3 | 1 | 33% | 20% | 0.25 |
| 🔵 term | 25 | 18 | 12 | 67% | 48% | 0.56 |
| 🟢 quantitative | 29 | 28 | 26 | 93% | 90% | 0.91 |

## Per-article matched/recall

| article | 🟡 context | 🔴 sensational | 🔵 term | 🟢 quantitative |
|---|---|---|---|---|
| b1-clickhouse | 2/4 (api 4) | 1/1 (api 1) | 3/10 (api 7) | 8/10 (api 8) |
| b2-tumen | 2/3 (api 3) | 0/3 (api 2) | 3/6 (api 5) | 6/6 (api 6) |
| b3-samsung-tax | 2/3 (api 3) | 0/1 (api 0) | 6/9 (api 6) | 12/13 (api 14) |