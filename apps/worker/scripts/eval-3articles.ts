/**
 * 3개 기사 fixture × 4 kind = 12 호출. API 응답 vs 정답(reference) 비교.
 *
 * 메트릭: kind 별 precision / recall / F1
 *   - matched: 정답 reference 와 API span 사이의 텍스트 겹침 (substring 양방향)
 *   - precision = matched / api_count
 *   - recall    = matched / ref_count
 *
 * 사용:
 *   (다른 터미널) cd apps/worker && pnpm dev
 *   pnpm tsx scripts/eval-3articles.ts
 *
 * 캐시 영향:
 *   본문이 같으면 D1 캐시 hit. 프롬프트만 바꿔서 재측정하려면 캐시 비우기 필요:
 *     npx wrangler d1 execute newtrospect --local --command="DELETE FROM analysis_cache"
 */

import { writeFileSync } from "node:fs";
import { ARTICLES_3, type Article3, type ReferenceItem } from "./fixtures-3articles.ts";
import type { AnalysisKind, AnalyzeResponse, Span } from "@newtrospect/core/server";

const BASE_URL = process.env.WORKER_URL ?? "http://127.0.0.1:8787";
const OUT_TAG = process.env.EVAL_TAG ?? "baseline";

const KINDS: readonly AnalysisKind[] = ["context", "sensational", "term", "quantitative"];
const KIND_PATH: Record<AnalysisKind, string> = {
  term: "terms",
  sensational: "sensational",
  quantitative: "quantitative",
  context: "context",
};
const KIND_LABEL: Record<AnalysisKind, string> = {
  term: "🔵 term",
  sensational: "🔴 sensational",
  quantitative: "🟢 quantitative",
  context: "🟡 context",
};

interface ApiSpan {
  text: string;
  payload: Record<string, unknown>;
}

interface CellResult {
  articleId: string;
  kind: AnalysisKind;
  model: string;
  elapsedMs: number;
  apiSpans: ApiSpan[];
  refItems: ReferenceItem[];
  matched: number;
  matchedDetails: Array<{ ref: string; api: string }>;
  missed: string[];
  extra: string[];
  error?: string;
}

/** 양방향 substring 매치. ref 가 api 에 포함되거나, api 가 ref 에 포함되면 매치. */
function matches(ref: string, api: string): boolean {
  const r = normalize(ref);
  const a = normalize(api);
  if (r.length === 0 || a.length === 0) return false;
  return r.includes(a) || a.includes(r);
}

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

async function runOne(article: Article3, kind: AnalysisKind): Promise<CellResult> {
  const t0 = Date.now();
  const refItems = article.reference[kind];
  try {
    const res = await fetch(`${BASE_URL}/api/analyze/${KIND_PATH[kind]}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: article.text, lang: "ko" }),
    });
    if (!res.ok) {
      return {
        articleId: article.id,
        kind,
        model: "?",
        elapsedMs: Date.now() - t0,
        apiSpans: [],
        refItems,
        matched: 0,
        matchedDetails: [],
        missed: refItems.map((r) => r.text),
        extra: [],
        error: `HTTP ${res.status}`,
      };
    }
    const json = (await res.json()) as AnalyzeResponse;
    const cps = Array.from(article.text);
    const apiSpans: ApiSpan[] = json.spans.map((s: Span) => ({
      text: cps.slice(s.start, s.end).join(""),
      payload: s.payload as Record<string, unknown>,
    }));

    const matchedRefIdx = new Set<number>();
    const matchedApiIdx = new Set<number>();
    const matchedDetails: Array<{ ref: string; api: string }> = [];
    for (let ri = 0; ri < refItems.length; ri++) {
      const ref = refItems[ri]!;
      for (let ai = 0; ai < apiSpans.length; ai++) {
        if (matchedApiIdx.has(ai)) continue;
        const api = apiSpans[ai]!;
        if (matches(ref.text, api.text)) {
          matchedRefIdx.add(ri);
          matchedApiIdx.add(ai);
          matchedDetails.push({ ref: ref.text, api: api.text });
          break;
        }
      }
    }
    const missed = refItems.filter((_, i) => !matchedRefIdx.has(i)).map((r) => r.text);
    const extra = apiSpans.filter((_, i) => !matchedApiIdx.has(i)).map((s) => s.text);

    return {
      articleId: article.id,
      kind,
      model: json.model,
      elapsedMs: json.elapsedMs,
      apiSpans,
      refItems,
      matched: matchedRefIdx.size,
      matchedDetails,
      missed,
      extra,
    };
  } catch (err) {
    return {
      articleId: article.id,
      kind,
      model: "?",
      elapsedMs: Date.now() - t0,
      apiSpans: [],
      refItems,
      matched: 0,
      matchedDetails: [],
      missed: refItems.map((r) => r.text),
      extra: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

async function main(): Promise<void> {
  const ts = new Date().toISOString();
  const results: CellResult[] = [];
  const lines: string[] = [];
  const log = (s = "") => {
    console.log(s);
    lines.push(s);
  };

  log(`# Eval 3-articles [${OUT_TAG}] — ${ts}`);
  log("");
  log(`Worker: ${BASE_URL}`);
  log(`Articles: ${ARTICLES_3.length} × Kinds: ${KINDS.length} = ${ARTICLES_3.length * KINDS.length} calls`);
  log("");

  for (const article of ARTICLES_3) {
    log("---");
    log("");
    log(`## ${article.id} — ${article.title}`);
    log(`- Source: ${article.source}`);
    log(`- Body: ${Array.from(article.text).length} codepoints`);
    log("");
    for (const kind of KINDS) {
      const cell = await runOne(article, kind);
      results.push(cell);
      const refN = cell.refItems.length;
      const apiN = cell.apiSpans.length;
      const recall = refN > 0 ? cell.matched / refN : 0;
      const precision = apiN > 0 ? cell.matched / apiN : 0;
      log(`### ${KIND_LABEL[kind]}`);
      if (cell.error) {
        log(`❌ ${cell.error} (${cell.elapsedMs}ms)`);
        log("");
        continue;
      }
      log(`- model: ${cell.model}, ${cell.elapsedMs}ms`);
      log(`- matched=${cell.matched}/${refN} (recall ${fmtPct(recall)}) · api=${apiN} (precision ${fmtPct(precision)})`);
      if (cell.matchedDetails.length > 0) {
        log(`- matched:`);
        for (const m of cell.matchedDetails) {
          const r = m.ref.length > 80 ? m.ref.slice(0, 80) + "…" : m.ref;
          const a = m.api.length > 80 ? m.api.slice(0, 80) + "…" : m.api;
          log(`  - REF \`${r}\` ↔ API \`${a}\``);
        }
      }
      if (cell.missed.length > 0) {
        log(`- missed (정답에 있는데 API 가 못 뽑음):`);
        for (const t of cell.missed) {
          log(`  - ${t.length > 100 ? t.slice(0, 100) + "…" : t}`);
        }
      }
      if (cell.extra.length > 0) {
        log(`- extra (정답에 없는데 API 가 추가로 뽑음):`);
        for (const t of cell.extra) {
          log(`  - ${t.length > 100 ? t.slice(0, 100) + "…" : t}`);
        }
      }
      log("");
    }
  }

  log("---");
  log("");
  log(`## Aggregate by kind`);
  log("");
  log(`| kind | ref | api | matched | precision | recall | F1 |`);
  log(`|---|---|---|---|---|---|---|`);
  for (const kind of KINDS) {
    const cells = results.filter((r) => r.kind === kind && !r.error);
    const refN = cells.reduce((a, c) => a + c.refItems.length, 0);
    const apiN = cells.reduce((a, c) => a + c.apiSpans.length, 0);
    const m = cells.reduce((a, c) => a + c.matched, 0);
    const precision = apiN > 0 ? m / apiN : 0;
    const recall = refN > 0 ? m / refN : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    log(`| ${KIND_LABEL[kind]} | ${refN} | ${apiN} | ${m} | ${fmtPct(precision)} | ${fmtPct(recall)} | ${f1.toFixed(2)} |`);
  }
  log("");
  log(`## Per-article matched/recall`);
  log("");
  log(`| article | 🟡 context | 🔴 sensational | 🔵 term | 🟢 quantitative |`);
  log(`|---|---|---|---|---|`);
  for (const article of ARTICLES_3) {
    const cell = (k: AnalysisKind) => {
      const c = results.find((r) => r.articleId === article.id && r.kind === k);
      if (!c || c.error) return c?.error ?? "?";
      return `${c.matched}/${c.refItems.length} (api ${c.apiSpans.length})`;
    };
    log(`| ${article.id} | ${cell("context")} | ${cell("sensational")} | ${cell("term")} | ${cell("quantitative")} |`);
  }

  writeFileSync(`eval-3-${OUT_TAG}.json`, JSON.stringify({ ts, tag: OUT_TAG, results }, null, 2));
  writeFileSync(`eval-3-${OUT_TAG}.md`, lines.join("\n"));
  console.log("");
  console.log(`→ eval-3-${OUT_TAG}.{json,md} 저장됨`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
