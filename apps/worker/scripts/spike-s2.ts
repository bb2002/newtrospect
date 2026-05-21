/**
 * S2 spike 러너 — Workers AI 한국어 분류 품질 비교.
 *
 * 사용법:
 *   1. `npx wrangler dev` 로 로컬 워커 띄우기 (apps/worker 디렉토리)
 *   2. 다른 터미널에서: `pnpm spike:s2`
 *   3. 본 스크립트가 각 fixture × 각 model × 4가지 분석을 돌려 표 출력
 *
 * 채점 방식: expected 목록의 각 문자열이 본문에서 매칭된 span 으로
 * 나왔는지 부분 일치(코드포인트 substring)로 카운트. 70% 이상 → 사용 가능 판단.
 *
 * 결과는 stdout 표 + spike-s2-results.json 으로 저장. 디자인 문서의
 * "Spike Results" 섹션에 요약을 옮겨 넣을 것.
 */

import { writeFileSync } from "node:fs";
import { FIXTURES } from "./fixtures.ts";
import type { AnalysisKind, AnalyzeResponse } from "@newtrospect/core/server";

const BASE_URL = process.env.WORKER_URL ?? "http://127.0.0.1:8787";

// 2026-05-21 S2 spike 에서 실제 실행한 후보들. qwen1.5-14b 와 gemma-2-9b 는
// Cloudflare 측 deprecation/미호스팅 으로 제외. 채택은 llama-3.1-8b.
// 결과는 spike-s2-results-<model>.json 5개 파일로 보존됨.
const CANDIDATE_MODELS = [
  "@cf/meta/llama-3.1-8b-instruct",
  "@cf/meta/llama-3.2-3b-instruct",
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
  "@cf/openai/gpt-oss-120b",
] as const;

const KINDS: readonly AnalysisKind[] = ["term", "sensational", "quantitative", "context"];

const KIND_PATH: Record<AnalysisKind, string> = {
  term: "terms",
  sensational: "sensational",
  quantitative: "quantitative",
  context: "context",
};

interface CellResult {
  model: string;
  kind: AnalysisKind;
  fixtureId: string;
  spans: number;
  hits: number;
  total: number;
  recall: number;
  elapsedMs: number;
  error?: string;
}

async function main() {
  const results: CellResult[] = [];

  // 워커가 모델을 override 할 수 있게 헤더로 전달 — 다음 PATCH 에서
  // 워커가 X-Override-Model 을 읽도록 추가해야 함. 일단 wrangler.toml
  // 의 MODEL_* 를 바꿔가며 측정하는 단순 경로로 진행.
  console.log("\nS2 spike 시작.");
  console.log(`Worker: ${BASE_URL}`);
  console.log("주의: 본 스크립트는 wrangler.toml 의 MODEL_* 환경변수를 바꿔가며 3회 실행할 것을 가정합니다.");
  console.log("현재 wrangler.toml 의 MODEL_* 값으로 한 번 측정합니다.\n");

  for (const fixture of FIXTURES) {
    for (const kind of KINDS) {
      const t0 = Date.now();
      try {
        const res = await fetch(`${BASE_URL}/api/analyze/${KIND_PATH[kind]}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: fixture.text, lang: "ko" }),
        });
        if (!res.ok) {
          results.push({
            model: "?",
            kind,
            fixtureId: fixture.id,
            spans: 0,
            hits: 0,
            total: expectedFor(fixture, kind).length,
            recall: 0,
            elapsedMs: Date.now() - t0,
            error: `HTTP ${res.status}`,
          });
          continue;
        }
        const json = (await res.json()) as AnalyzeResponse;
        const expected = expectedFor(fixture, kind);
        const matched = countMatches(fixture.text, json.spans, expected);
        results.push({
          model: json.model,
          kind,
          fixtureId: fixture.id,
          spans: json.spans.length,
          hits: matched,
          total: expected.length,
          recall: expected.length === 0 ? 1 : matched / expected.length,
          elapsedMs: json.elapsedMs,
        });
      } catch (err) {
        results.push({
          model: "?",
          kind,
          fixtureId: fixture.id,
          spans: 0,
          hits: 0,
          total: expectedFor(fixture, kind).length,
          recall: 0,
          elapsedMs: Date.now() - t0,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  console.table(results);

  const summary = summarize(results);
  console.log("\nKind 별 평균 recall + p95 latency:");
  console.table(summary);

  writeFileSync(
    "spike-s2-results.json",
    JSON.stringify({ candidates: CANDIDATE_MODELS, results, summary }, null, 2),
  );
  console.log("\n→ apps/worker/spike-s2-results.json 에 저장됨.");
  console.log("디자인 문서 'Spike Results' 섹션에 요약을 옮겨 적을 것.");
}

function expectedFor(fixture: (typeof FIXTURES)[number], kind: AnalysisKind): readonly string[] {
  switch (kind) {
    case "term": return fixture.expectedTerms;
    case "sensational": return fixture.expectedSensational;
    case "quantitative": return fixture.expectedQuantitative;
    case "context": return []; // context 는 정답 정의가 모호 → recall 측정 제외
  }
}

function countMatches(text: string, spans: AnalyzeResponse["spans"], expected: readonly string[]): number {
  const cps = Array.from(text);
  const spanTexts = spans.map((s) => cps.slice(s.start, s.end).join(""));
  let hits = 0;
  for (const exp of expected) {
    if (spanTexts.some((st) => st.includes(exp) || exp.includes(st))) hits++;
  }
  return hits;
}

function summarize(results: CellResult[]) {
  const byKind = new Map<AnalysisKind, CellResult[]>();
  for (const r of results) {
    const arr = byKind.get(r.kind) ?? [];
    arr.push(r);
    byKind.set(r.kind, arr);
  }
  const summary: Array<{ kind: AnalysisKind; avgRecall: number; p95LatencyMs: number; errors: number }> = [];
  for (const [kind, arr] of byKind) {
    const recalls = arr.map((r) => r.recall);
    const lats = arr.filter((r) => !r.error).map((r) => r.elapsedMs).sort((a, b) => a - b);
    const errors = arr.filter((r) => r.error).length;
    summary.push({
      kind,
      avgRecall: avg(recalls),
      p95LatencyMs: lats.length === 0 ? 0 : lats[Math.min(lats.length - 1, Math.floor(lats.length * 0.95))]!,
      errors,
    });
  }
  return summary;
}

function avg(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
