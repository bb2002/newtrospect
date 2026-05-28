/**
 * build-fixtures — news.md / non-news.md 의 URL을 fetch 후 익스텐션과 동일한 추출
 * (Readability) 로 본문 평문을 뽑아 fixture JSON 으로 저장한다.
 *
 * 익스텐션은 HTML 전체가 아니라 extractArticleText 로 만든 *본문 평문 text* 를 서버에 보낸다.
 * 평가가 프로덕션과 같으려면 fixture 도 같은 방식의 추출 text 여야 한다.
 *
 * 실행 (apps/worker 에서 — jsdom/@mozilla/readability 가 거기 설치됨):
 *   cd apps/worker
 *   pnpm tsx ../../.claude/skills/build-fixtures/scripts/build-fixtures.ts
 *
 * 환경변수:
 *   NEWS=../../news.md  NONNEWS=../../non-news.md  OUT=fixtures  CONCURRENCY=6  FORCE=0
 *
 * 캐시: 이미 있는 fixture 파일은 건너뜀(FORCE=1 이면 전체 재추출).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const NEWS = process.env.NEWS ?? "../../news.md";
const NONNEWS = process.env.NONNEWS ?? "../../non-news.md";
const OUT = process.env.OUT ?? "fixtures";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? "6");
const FORCE = process.env.FORCE === "1";
const FETCH_TIMEOUT_MS = 15_000;
const MIN_BODY_LENGTH = 200; // core/types.ts MIN_BODY_LENGTH 와 동일
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

type Label = "news" | "non-news";
type Status = "ok" | "too_short" | "fetch_failed" | "extract_failed" | "blocked";

interface Fixture {
  url: string;
  label: Label;
  status: Status;
  text: string;
  textLen: number;
  extractedAt: string;
  httpStatus?: number;
  errorMessage?: string;
}

function id(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 12);
}

function readUrls(path: string): string[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("http"));
}

function normalize(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

async function fetchAndExtract(url: string, label: Label): Promise<Fixture> {
  const extractedAt = new Date().toISOString();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "accept-language": "ko-KR,ko;q=0.9,en;q=0.5" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) {
      return { url, label, status: "fetch_failed", text: "", textLen: 0, extractedAt, httpStatus: res.status };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) {
      return { url, label, status: "blocked", text: "", textLen: 0, extractedAt, httpStatus: res.status, errorMessage: `content-type=${ct}` };
    }
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();
    const text = normalize(article?.textContent ?? "");
    if (text.length < MIN_BODY_LENGTH) {
      return { url, label, status: "too_short", text, textLen: text.length, extractedAt, httpStatus: res.status };
    }
    return { url, label, status: "ok", text, textLen: text.length, extractedAt, httpStatus: res.status };
  } catch (err) {
    return { url, label, status: "extract_failed", text: "", textLen: 0, extractedAt, errorMessage: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

async function parMap<T>(items: T[], conc: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  async function worker(): Promise<void> {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(conc, items.length) }, () => worker()));
}

async function build(label: Label, urls: string[]): Promise<{ ok: number; fail: number; lens: number[] }> {
  const dir = join(OUT, label);
  mkdirSync(dir, { recursive: true });
  let ok = 0, fail = 0;
  const lens: number[] = [];
  let done = 0;
  await parMap(urls, CONCURRENCY, async (url) => {
    const path = join(dir, `${id(url)}.json`);
    if (!FORCE && existsSync(path)) {
      const cached = JSON.parse(readFileSync(path, "utf8")) as Fixture;
      if (cached.status === "ok") { ok++; lens.push(cached.textLen); } else fail++;
      done++;
      return;
    }
    const fx = await fetchAndExtract(url, label);
    writeFileSync(path, JSON.stringify(fx, null, 2));
    if (fx.status === "ok") { ok++; lens.push(fx.textLen); } else fail++;
    done++;
    if (done % 10 === 0 || done === urls.length) console.log(`  ${label}: ${done}/${urls.length}`);
  });
  return { ok, fail, lens };
}

async function main(): Promise<void> {
  const news = readUrls(NEWS);
  const nonnews = readUrls(NONNEWS);
  console.log(`build-fixtures: news=${news.length}, non-news=${nonnews.length}, force=${FORCE}`);

  const n = await build("news", news);
  const nn = await build("non-news", nonnews);

  const avg = (a: number[]) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0);
  console.log("\n## summary");
  console.log(`news     : ok=${n.ok} fail=${n.fail} avgLen=${avg(n.lens)}cp`);
  console.log(`non-news : ok=${nn.ok} fail=${nn.fail} avgLen=${avg(nn.lens)}cp`);
  const total = news.length + nonnews.length;
  const okTotal = n.ok + nn.ok;
  console.log(`extract success rate = ${total ? ((okTotal / total) * 100).toFixed(1) : 0}%`);
  if (total && okTotal / total < 0.7) console.log("⚠️ 추출 성공률 <70% — 셀렉터/UA/차단 점검 필요");
}

main().catch((e) => { console.error(e); process.exit(1); });
