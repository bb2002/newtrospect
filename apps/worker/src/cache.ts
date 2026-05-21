import type { AnalysisKind, AnalyzeResponse, DetectArticleResponse } from "@newtrospect/core/server";
import type { Env } from "./env.ts";

const DETECT_KIND = "detect" as const;

export async function readCache(
  env: Env,
  bodyHash: string,
  kind: AnalysisKind,
): Promise<AnalyzeResponse | null> {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "SELECT response_json, model FROM analysis_cache WHERE body_hash = ?1 AND kind = ?2 AND expires_at > ?3",
  )
    .bind(bodyHash, kind, now)
    .first<{ response_json: string; model: string }>();
  if (!row) return null;
  try {
    const parsed = JSON.parse(row.response_json) as AnalyzeResponse;
    return { ...parsed, cached: true };
  } catch {
    return null;
  }
}

export async function writeCache(
  env: Env,
  bodyHash: string,
  kind: AnalysisKind,
  response: AnalyzeResponse,
  ttlSec: number,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO analysis_cache (body_hash, kind, response_json, model, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(body_hash, kind) DO UPDATE SET
       response_json = excluded.response_json,
       model = excluded.model,
       created_at = excluded.created_at,
       expires_at = excluded.expires_at`,
  )
    .bind(bodyHash, kind, JSON.stringify(response), response.model, now, now + ttlSec)
    .run();
}

/**
 * detect-article 판정 결과 캐시. analysis_cache 테이블 재사용 (kind="detect").
 * 같은 본문에 대해 같은 판정이 반복되므로 캐싱 가치 큼.
 */
export async function readDetectCache(env: Env, bodyHash: string): Promise<DetectArticleResponse | null> {
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    "SELECT response_json FROM analysis_cache WHERE body_hash = ?1 AND kind = ?2 AND expires_at > ?3",
  )
    .bind(bodyHash, DETECT_KIND, now)
    .first<{ response_json: string }>();
  if (!row) return null;
  try {
    return JSON.parse(row.response_json) as DetectArticleResponse;
  } catch {
    return null;
  }
}

export async function writeDetectCache(
  env: Env,
  bodyHash: string,
  model: string,
  response: DetectArticleResponse,
  ttlSec: number,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO analysis_cache (body_hash, kind, response_json, model, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(body_hash, kind) DO UPDATE SET
       response_json = excluded.response_json,
       model = excluded.model,
       created_at = excluded.created_at,
       expires_at = excluded.expires_at`,
  )
    .bind(bodyHash, DETECT_KIND, JSON.stringify(response), model, now, now + ttlSec)
    .run();
}

export async function logRequest(
  env: Env,
  fields: {
    host: string | null;
    kind: AnalysisKind | "detect";
    model: string | null;
    elapsedMs: number | null;
    statusCode: number;
    cacheHit: boolean;
  },
): Promise<void> {
  const ts = Math.floor(Date.now() / 1000);
  await env.DB.prepare(
    `INSERT INTO request_log (ts, host, kind, model, elapsed_ms, status_code, cache_hit)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  )
    .bind(
      ts,
      fields.host,
      fields.kind,
      fields.model,
      fields.elapsedMs,
      fields.statusCode,
      fields.cacheHit ? 1 : 0,
    )
    .run();
}
