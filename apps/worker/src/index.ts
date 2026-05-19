import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AnalysisKind, AnalyzeResponse, DetectArticleResponse } from "@newtrospect/core/server";
import { MIN_BODY_LENGTH, sha256Hex } from "@newtrospect/core/server";
import type { Env } from "./env.ts";
import { cacheTtlSec, modelFor, providerFor } from "./env.ts";
import { readCache, writeCache, logRequest } from "./cache.ts";
import { workersAIProvider } from "./providers/workers-ai.ts";
import type { AIProvider } from "./provider.ts";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*", allowMethods: ["POST", "GET", "OPTIONS"] }));

app.get("/health", (c) => c.json({ ok: true }));

/**
 * 본문 평문을 받아 (a) 뉴스 기사 여부 (b) 정제된 본문 반환.
 * URL fetch 는 하지 않는다 — 봇 차단·로그인 벽 회피 정책.
 */
app.post("/api/detect-article", async (c) => {
  const body: { text?: string; url?: string } = await c.req.json().catch(() => ({}));
  const text = (body.text ?? "").trim();
  if (text.length < MIN_BODY_LENGTH) {
    return c.json<DetectArticleResponse>({
      isArticle: false,
      cleanedText: "",
      reason: `본문이 ${MIN_BODY_LENGTH}자 미만 (단신·페이월 추정)`,
    });
  }
  // Phase 1: 휴리스틱만. 추후 AI 판독 가능.
  const cleaned = text.replace(/\s+/g, " ").trim();
  return c.json<DetectArticleResponse>({
    isArticle: true,
    cleanedText: cleaned,
  });
});

const KINDS: readonly AnalysisKind[] = ["term", "sensational", "quantitative", "context"];
for (const kind of KINDS) {
  app.post(`/api/analyze/${kind === "term" ? "terms" : kind}`, (c) => handleAnalyze(c.env, c.req.raw, kind));
}

async function handleAnalyze(env: Env, req: Request, kind: AnalysisKind): Promise<Response> {
  const url = new URL(req.url);
  const reqOrigin = req.headers.get("origin");
  let host: string | null = null;
  try {
    host = reqOrigin ? new URL(reqOrigin).hostname : null;
  } catch {
    host = null;
  }

  const body = await req.json().catch(() => ({})) as { text?: string };
  const text = (body.text ?? "").trim();
  if (text.length < MIN_BODY_LENGTH) {
    await logRequest(env, { host, kind, model: null, elapsedMs: null, statusCode: 400, cacheHit: false });
    return Response.json({ error: "text too short" }, { status: 400 });
  }

  const bodyHash = await sha256Hex(text);
  const cached = await readCache(env, bodyHash, kind);
  if (cached) {
    await logRequest(env, { host, kind, model: cached.model, elapsedMs: cached.elapsedMs, statusCode: 200, cacheHit: true });
    return Response.json(cached);
  }

  const providerName = providerFor(env, kind);
  const model = modelFor(env, kind);
  const provider = resolveProvider(providerName);
  if (!provider) {
    await logRequest(env, { host, kind, model, elapsedMs: null, statusCode: 500, cacheHit: false });
    return Response.json({ error: `unknown provider: ${providerName}` }, { status: 500 });
  }

  try {
    const result = await provider.analyze(env, { kind, text, model });
    const response: AnalyzeResponse = { spans: result.spans, model: result.model, elapsedMs: result.elapsedMs };
    await writeCache(env, bodyHash, kind, response, cacheTtlSec(env));
    await logRequest(env, { host, kind, model: result.model, elapsedMs: result.elapsedMs, statusCode: 200, cacheHit: false });
    return Response.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logRequest(env, { host, kind, model, elapsedMs: null, statusCode: 500, cacheHit: false });
    return Response.json({ error: msg }, { status: 500 });
  }
}

function resolveProvider(name: string): AIProvider | null {
  if (name === "workers-ai") return workersAIProvider;
  // gemini provider 는 S2 spike 후 추가.
  return null;
}

export default app;
