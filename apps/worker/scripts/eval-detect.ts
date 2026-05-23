/**
 * detect-article 평가 — 라벨링된 URL 묶음에 대해 본문 추출 + /api/detect-article 호출
 * → ground truth 와 비교 → confusion matrix + 실패 케이스 목록.
 *
 * 캐싱:
 *   - URL fetch + 본문 추출 결과는 eval-detect-cache.json 에 영구 저장.
 *   - 같은 URL 두 번 fetch 안 함. 프롬프트만 바꿔서 빠르게 재측정 가능.
 *   - detect 호출 결과는 캐싱 안 함 (워커 D1 자체 캐시는 별개).
 *
 * 사용:
 *   (다른 터미널) cd apps/worker && pnpm dev
 *   pnpm tsx scripts/eval-detect.ts                  # 기본 50+50 sample
 *   SAMPLE=100 pnpm tsx scripts/eval-detect.ts       # 100+100
 *   SAMPLE=all pnpm tsx scripts/eval-detect.ts       # 전체
 *   EVAL_TAG=baseline pnpm tsx scripts/eval-detect.ts
 *
 * 캐시 무효화:
 *   rm eval-detect-cache.json
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const WORKER_URL = process.env.WORKER_URL ?? "http://127.0.0.1:8787";
const SAMPLE_RAW = process.env.SAMPLE ?? "50";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? "6");
const OUT_TAG = process.env.EVAL_TAG ?? "baseline";
const CACHE_PATH = "eval-detect-cache.json";
const NON_ARTICLE_PATH = "../../non_article.txt";
const ARTICLE_PATH = "../../article.txt";
const FETCH_TIMEOUT_MS = 15_000;
const MIN_TEXT_LEN = 80;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface CacheEntry {
  url: string;
  status: "ok" | "fetch_failed" | "extract_failed" | "too_short" | "blocked";
  text: string;
  textLen: number;
  fetchedAt: string;
  httpStatus?: number;
  errorMessage?: string;
}

type Cache = Record<string, CacheEntry>;

interface DetectResult {
  isArticle: boolean;
  reason?: string;
}

interface Row {
  url: string;
  label: "article" | "non_article";
  cache: CacheEntry;
  detect: DetectResult | null;
  detectError?: string;
  /** 추출 실패한 URL: 익스텐션 동작도 같음(분석 skip) → non_article 와 등가로 본다. */
  effectivePred: boolean | null;
  correct: boolean;
}

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return {};
  }
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function readUrls(path: string): string[] {
  const raw = readFileSync(path, "utf8");
  return raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && l.startsWith("http"));
}

function pickSample(urls: string[], n: number | "all"): string[] {
  if (n === "all" || n >= urls.length) return urls.slice();
  // 결정적 sampling (seed 고정) — 매번 같은 sample 유지해 비교 가능.
  // 단순 stride sampling.
  const stride = urls.length / n;
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(i * stride);
    out.push(urls[idx]!);
  }
  return out;
}

async function fetchAndExtract(url: string): Promise<CacheEntry> {
  const fetchedAt = new Date().toISOString();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "ko-KR,ko;q=0.9,en;q=0.5" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { url, status: "fetch_failed", text: "", textLen: 0, fetchedAt, httpStatus: res.status };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) {
      return { url, status: "blocked", text: "", textLen: 0, fetchedAt, httpStatus: res.status, errorMessage: `content-type=${ct}` };
    }
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    const text = (article?.textContent ?? "").replace(/\s+/g, " ").trim();
    if (text.length < MIN_TEXT_LEN) {
      return { url, status: "too_short", text, textLen: text.length, fetchedAt, httpStatus: res.status };
    }
    return { url, status: "ok", text, textLen: text.length, fetchedAt, httpStatus: res.status };
  } catch (err) {
    return { url, status: "extract_failed", text: "", textLen: 0, fetchedAt, errorMessage: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function callDetect(text: string): Promise<DetectResult | null> {
  try {
    const res = await fetch(`${WORKER_URL}/api/detect-article`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return (await res.json()) as DetectResult;
  } catch {
    return null;
  }
}

async function parMap<T, R>(items: T[], conc: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!, i);
    }
  }
  const workers = Array.from({ length: Math.min(conc, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

async function ensureExtracted(urls: string[], cache: Cache, label: string): Promise<void> {
  const missing = urls.filter((u) => !cache[u]);
  if (missing.length === 0) {
    console.log(`  ${label}: 캐시 hit 전체 (${urls.length}개)`);
    return;
  }
  console.log(`  ${label}: ${urls.length}개 중 ${missing.length}개 fetch 필요`);
  let done = 0;
  await parMap(missing, CONCURRENCY, async (url) => {
    const entry = await fetchAndExtract(url);
    cache[url] = entry;
    done++;
    if (done % 10 === 0 || done === missing.length) {
      console.log(`    ${label} fetched ${done}/${missing.length}`);
      saveCache(cache);
    }
  });
  saveCache(cache);
}

async function runDetectAll(urls: string[], cache: Cache, label: "article" | "non_article"): Promise<Row[]> {
  return parMap(urls, CONCURRENCY, async (url) => {
    const c = cache[url]!;
    if (c.status !== "ok") {
      // 본문 추출 실패는 *익스텐션 동작 기준* non_article 와 등가 (분석 skip).
      return {
        url,
        label,
        cache: c,
        detect: null,
        detectError: c.status,
        effectivePred: false,
        correct: label === "non_article" ? true : false,
      };
    }
    const det = await callDetect(c.text);
    if (!det) {
      return { url, label, cache: c, detect: null, detectError: "detect_call_failed", effectivePred: null, correct: false };
    }
    const correct = label === "article" ? det.isArticle === true : det.isArticle === false;
    return { url, label, cache: c, detect: det, effectivePred: det.isArticle, correct };
  });
}

function summarize(rows: Row[]): {
  total: number;
  correct: number;
  accuracy: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  extractFailed: number;
  detectCallFailed: number;
} {
  let tp = 0, fp = 0, tn = 0, fn = 0, extractFailed = 0, detectCallFailed = 0;
  for (const r of rows) {
    if (r.detectError === "detect_call_failed") detectCallFailed++;
    if (r.cache.status !== "ok") extractFailed++;
    if (r.effectivePred === null) continue;
    if (r.label === "article" && r.effectivePred) tp++;
    else if (r.label === "article" && !r.effectivePred) fn++;
    else if (r.label === "non_article" && r.effectivePred) fp++;
    else if (r.label === "non_article" && !r.effectivePred) tn++;
  }
  const correct = rows.filter((r) => r.correct).length;
  return {
    total: rows.length,
    correct,
    accuracy: correct / rows.length,
    tp, fp, tn, fn,
    extractFailed, detectCallFailed,
  };
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(2)}%`;
}

async function main(): Promise<void> {
  const sample: number | "all" = SAMPLE_RAW === "all" ? "all" : Number(SAMPLE_RAW);
  console.log(`# eval-detect [${OUT_TAG}]`);
  console.log(`worker=${WORKER_URL}, sample=${sample}, concurrency=${CONCURRENCY}`);

  const nonArticleAll = readUrls(NON_ARTICLE_PATH);
  const articleAll = readUrls(ARTICLE_PATH);
  console.log(`loaded: non_article=${nonArticleAll.length}, article=${articleAll.length}`);

  const nonArticleSample = pickSample(nonArticleAll, sample);
  const articleSample = pickSample(articleAll, sample);
  console.log(`sampled: non_article=${nonArticleSample.length}, article=${articleSample.length}`);

  const cache = loadCache();

  console.log("\n[fetch+extract]");
  await ensureExtracted(nonArticleSample, cache, "non_article");
  await ensureExtracted(articleSample, cache, "article");

  console.log("\n[detect]");
  const naRows = await runDetectAll(nonArticleSample, cache, "non_article");
  const aRows = await runDetectAll(articleSample, cache, "article");
  const rows = [...naRows, ...aRows];

  const sum = summarize(rows);
  console.log("");
  console.log(`## Result [${OUT_TAG}]`);
  console.log(`accuracy = ${sum.correct}/${sum.total} = ${fmtPct(sum.accuracy)}`);
  console.log("");
  console.log(`              | predicted article | predicted non-article`);
  console.log(`actual article| TP=${sum.tp.toString().padStart(4)}        | FN=${sum.fn.toString().padStart(4)}`);
  console.log(`actual nonart.| FP=${sum.fp.toString().padStart(4)}        | TN=${sum.tn.toString().padStart(4)}`);
  console.log("");
  if (sum.tp + sum.fn > 0) console.log(`article recall   = ${fmtPct(sum.tp / (sum.tp + sum.fn))}`);
  if (sum.tn + sum.fp > 0) console.log(`non-article recall = ${fmtPct(sum.tn / (sum.tn + sum.fp))}`);
  console.log(`extract_failed (취급: non_article)  = ${sum.extractFailed}`);
  console.log(`detect_call_failed                  = ${sum.detectCallFailed}`);

  // 실패 케이스 dump
  const fps = rows.filter((r) => r.label === "non_article" && r.effectivePred === true);
  const fns = rows.filter((r) => r.label === "article" && r.effectivePred === false);
  console.log("");
  console.log(`## False Positives (non_article → predicted article) — ${fps.length}`);
  for (const r of fps) {
    const head = r.cache.text.slice(0, 100).replace(/\s+/g, " ");
    console.log(`- [${r.cache.textLen}cp] ${r.url}`);
    console.log(`    reason: ${r.detect?.reason ?? ""}`);
    console.log(`    head: ${head}`);
  }
  console.log("");
  console.log(`## False Negatives (article → predicted non_article) — ${fns.length}`);
  for (const r of fns) {
    const head = r.cache.text.slice(0, 100).replace(/\s+/g, " ");
    console.log(`- [${r.cache.textLen}cp] ${r.url}`);
    console.log(`    reason: ${r.detect?.reason ?? r.detectError ?? ""}`);
    console.log(`    head: ${head}`);
  }

  writeFileSync(
    `eval-detect-${OUT_TAG}.json`,
    JSON.stringify({ tag: OUT_TAG, sample, summary: sum, rows }, null, 2),
  );
  console.log(`\n→ eval-detect-${OUT_TAG}.json 저장됨`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
