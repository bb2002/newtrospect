/**
 * collect-responses — fixture 의 추출 text 를 worker 엔드포인트에 POST 해서 응답을 모은다.
 * 채점(judge)은 에이전트가 별도로 하고, 이 스크립트는 *결정적인* 호출/수집만 담당한다.
 *
 * 실행:
 *   (다른 터미널) cd apps/worker && pnpm dev
 *   pnpm tsx ../../.claude/skills/eval-feature/scripts/collect-responses.ts
 *
 * 환경변수:
 *   FEATURE=detect|terms|sensational|quantitative|context|briefing|oneline  (필수)
 *   SCOPE=news|non-news|both   (기본: detect=both, 그 외=news)
 *   FIXDIR=../../apps/worker/fixtures  (apps/worker 에서 실행 시: fixtures)
 *   WORKER=http://127.0.0.1:8787  CONCURRENCY=6  RUNTAG=<버전태그>
 *   OUT=../../_workspace/eval/<feature>/<runTag>/responses.json
 *
 * ★ 전수 평가 강제 규칙: 서브샘플링 옵션 없음. scope 내 *모든* fixture 를 평가하고
 *   collected/evaluated/coverage 를 출력한다(감사 게이트가 읽음).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const FEATURE = process.env.FEATURE ?? "";
const WORKER = process.env.WORKER ?? "http://127.0.0.1:8787";
const FIXDIR = process.env.FIXDIR ?? "fixtures";
const CONCURRENCY = Number(process.env.CONCURRENCY ?? "6");

const ENDPOINT: Record<string, string> = {
  detect: "/api/detect-article",
  terms: "/api/analyze/terms",
  sensational: "/api/analyze/sensational",
  quantitative: "/api/analyze/quantitative",
  context: "/api/analyze/context",
  briefing: "/api/analyze/briefing",
  oneline: "/api/analyze/oneline",
};

if (!ENDPOINT[FEATURE]) {
  console.error(`FEATURE 필수: ${Object.keys(ENDPOINT).join("|")}`);
  process.exit(1);
}
const SCOPE = process.env.SCOPE ?? (FEATURE === "detect" ? "both" : "news");
const RUNTAG = process.env.RUNTAG ?? "latest";
const OUT = process.env.OUT ?? `../../_workspace/eval/${FEATURE}/${RUNTAG}/responses.json`;

interface Fixture { url: string; label: string; status: string; text: string; textLen: number; }

function loadFixtures(label: "news" | "non-news"): Fixture[] {
  const dir = join(FIXDIR, label);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Fixture);
}

async function call(text: string): Promise<unknown> {
  const res = await fetch(`${WORKER}${ENDPOINT[FEATURE]}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(FEATURE === "detect" ? { text } : { text, lang: "ko" }),
  });
  if (!res.ok) return { __error: res.status };
  return res.json();
}

async function parMap<T, R>(items: T[], conc: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(conc, items.length) }, async () => {
    while (true) { const i = next++; if (i >= items.length) return; out[i] = await fn(items[i]!, i); }
  }));
  return out;
}

async function main(): Promise<void> {
  const fixtures: Fixture[] = [];
  if (SCOPE === "news" || SCOPE === "both") fixtures.push(...loadFixtures("news"));
  if (SCOPE === "non-news" || SCOPE === "both") fixtures.push(...loadFixtures("non-news"));

  // 전수 평가 강제: 서브샘플링 없음 — scope 내 모든 fixture 를 처리한다.
  // detect 는 추출 실패 fixture 도 호출 대상(빈 text → 비뉴스 예측 = 익스텐션 동작과 등가).
  // 그 외 분석은 status=ok 만 호출하되, 실패분도 row 로 남겨 *전수 회계*가 보이게 한다.
  console.log(`FEATURE=${FEATURE} scope=${SCOPE} collected=${fixtures.length} worker=${WORKER}`);
  const rows = await parMap(fixtures, CONCURRENCY, async (fx) => {
    if (FEATURE !== "detect" && fx.status !== "ok") {
      return { url: fx.url, label: fx.label, status: fx.status, textLen: fx.textLen, response: null as unknown };
    }
    const response = await call(fx.text);
    return { url: fx.url, label: fx.label, status: fx.status, textLen: fx.textLen, response };
  });

  const evaluated = rows.filter((r) => r.response !== null).length;
  const skipped = rows.length - evaluated;
  const coverage = rows.length ? evaluated / rows.length : 0;

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({ feature: FEATURE, scope: SCOPE, collected: rows.length, evaluated, skipped, coverage, rows }, null, 2),
  );
  console.log(`collected=${rows.length} evaluated=${evaluated} skipped(extract_failed)=${skipped} coverage=${(coverage * 100).toFixed(1)}%`);
  if (skipped > 0) {
    console.log(`⚠️ ${skipped}건 추출 실패로 분석 불가 — 전수 규칙상 감사에서 명시하고 수집 단계에서 교체해야 함`);
  }
  console.log(`→ ${OUT} 저장`);
}

main().catch((e) => { console.error(e); process.exit(1); });
