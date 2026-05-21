/**
 * Quality eval — 실제 한국 뉴스 4편에 대해 4가지 분석을 호출하고 결과를 보기 좋게 출력.
 *
 * 사용법:
 *   1. (다른 터미널) cd apps/worker && pnpm dev
 *   2. pnpm quality:eval
 *      → 자동으로 D1 캐시 비우고 16 호출 후 markdown 표 출력 + quality-eval-results.json 저장
 *
 * 사용자 정의:
 *   🔵 term         = 어려운 *단어*
 *   🔴 sensational  = 자극적 *문장*
 *   🟢 quantitative = 수치 *단어/문장*
 *   🟡 context      = 핵심 *문장*
 */

import { writeFileSync } from "node:fs";
import { ARTICLES, type RealArticle } from "./fixtures-real.ts";
import type { AnalysisKind, AnalyzeResponse } from "@newtrospect/core/server";

const BASE_URL = process.env.WORKER_URL ?? "http://127.0.0.1:8787";

const KINDS: readonly AnalysisKind[] = ["context", "sensational", "term", "quantitative"];
const KIND_PATH: Record<AnalysisKind, string> = {
  term: "terms",
  sensational: "sensational",
  quantitative: "quantitative",
  context: "context",
};
const KIND_LABEL: Record<AnalysisKind, string> = {
  term: "🔵 term (어려운 단어)",
  sensational: "🔴 sensational (자극 문장)",
  quantitative: "🟢 quantitative (수치)",
  context: "🟡 context (핵심 문장)",
};

interface CellResult {
  articleId: string;
  source: string;
  kind: AnalysisKind;
  model: string;
  elapsedMs: number;
  spanCount: number;
  spans: Array<{ text: string; payload: Record<string, unknown> }>;
  error?: string;
}

async function main(): Promise<void> {
  const ts = new Date().toISOString();
  const lines: string[] = [];
  const log = (s = "") => {
    console.log(s);
    lines.push(s);
  };

  log(`# Quality Eval — ${ts}`);
  log("");
  log(`Worker: ${BASE_URL}`);
  log(`Articles: ${ARTICLES.length} × Kinds: ${KINDS.length} = ${ARTICLES.length * KINDS.length} calls`);
  log("");

  const results: CellResult[] = [];

  for (const article of ARTICLES) {
    log(`---`);
    log("");
    log(`## ${article.id} — ${article.title}`);
    log(`- Source: ${article.source}`);
    log(`- URL: ${article.url}`);
    log(`- Body: ${Array.from(article.text).length} codepoints`);
    log("");

    for (const kind of KINDS) {
      const cell = await runOne(article, kind);
      results.push(cell);
      printCell(cell, log);
    }
  }

  log("");
  log("---");
  log("");
  log(`## Summary`);
  log("");
  log(`| Article | 🟡 context | 🔴 sensational | 🔵 term | 🟢 quantitative | total ms |`);
  log(`|---|---|---|---|---|---|`);
  for (const article of ARTICLES) {
    const row = results.filter((r) => r.articleId === article.id);
    const get = (k: AnalysisKind) => row.find((r) => r.kind === k);
    const total = row.reduce((acc, r) => acc + (r.elapsedMs || 0), 0);
    const cell = (k: AnalysisKind) => {
      const c = get(k);
      if (!c) return "?";
      if (c.error) return `❌ ${c.error}`;
      return `${c.spanCount} (${c.elapsedMs}ms)`;
    };
    log(`| ${article.id} | ${cell("context")} | ${cell("sensational")} | ${cell("term")} | ${cell("quantitative")} | ${total}ms |`);
  }

  writeFileSync("quality-eval-results.json", JSON.stringify({ ts, results }, null, 2));
  writeFileSync("quality-eval-results.md", lines.join("\n"));
  console.log("");
  console.log("→ quality-eval-results.{json,md} 저장됨");
}

async function runOne(article: RealArticle, kind: AnalysisKind): Promise<CellResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE_URL}/api/analyze/${KIND_PATH[kind]}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: article.text, lang: "ko" }),
    });
    if (!res.ok) {
      return {
        articleId: article.id,
        source: article.source,
        kind,
        model: "?",
        elapsedMs: Date.now() - t0,
        spanCount: 0,
        spans: [],
        error: `HTTP ${res.status}`,
      };
    }
    const json = (await res.json()) as AnalyzeResponse;
    const cps = Array.from(article.text);
    const spans = json.spans.map((s) => ({
      text: cps.slice(s.start, s.end).join(""),
      payload: s.payload as Record<string, unknown>,
    }));
    return {
      articleId: article.id,
      source: article.source,
      kind,
      model: json.model,
      elapsedMs: json.elapsedMs,
      spanCount: spans.length,
      spans,
    };
  } catch (err) {
    return {
      articleId: article.id,
      source: article.source,
      kind,
      model: "?",
      elapsedMs: Date.now() - t0,
      spanCount: 0,
      spans: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function printCell(cell: CellResult, log: (s?: string) => void): void {
  const head = `### ${KIND_LABEL[cell.kind]}`;
  const meta = cell.error
    ? `❌ ${cell.error} (${cell.elapsedMs}ms)`
    : `${cell.spanCount}개 · ${cell.model} · ${cell.elapsedMs}ms`;
  log(head);
  log(`*${meta}*`);
  log("");
  if (cell.error) return;
  if (cell.spans.length === 0) {
    log("_(없음)_");
    log("");
    return;
  }
  for (const s of cell.spans) {
    const text = s.text.length > 140 ? s.text.slice(0, 140) + "…" : s.text;
    const reason = (s.payload.reason as string) || (s.payload.explanation as string) || (s.payload.searchQuery as string) || "";
    const info = reason ? ` — _${reason}_` : "";
    log(`- ${text.replace(/\n/g, " ")}${info}`);
  }
  log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
