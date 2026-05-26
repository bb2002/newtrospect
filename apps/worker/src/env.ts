import type { AnalysisKind } from "@newtrospect/core/server";

export interface Env {
  AI: Ai;
  DB: D1Database;

  PROVIDER_TERM: string;
  PROVIDER_SENSATIONAL: string;
  PROVIDER_QUANTITATIVE: string;
  PROVIDER_CONTEXT: string;
  PROVIDER_DETECT: string;
  /** summary / character / rewrite 등 보조 분석에 공통 사용. */
  PROVIDER_AUX: string;

  MODEL_TERM: string;
  MODEL_SENSATIONAL: string;
  MODEL_QUANTITATIVE: string;
  MODEL_CONTEXT: string;
  MODEL_DETECT: string;
  MODEL_AUX: string;

  CACHE_TTL_SEC: string;

  /** Gemini provider 사용 시 필요 — wrangler secret put GEMINI_API_KEY */
  GEMINI_API_KEY?: string;
}

const PROVIDER_KEY = {
  term: "PROVIDER_TERM",
  sensational: "PROVIDER_SENSATIONAL",
  quantitative: "PROVIDER_QUANTITATIVE",
  context: "PROVIDER_CONTEXT",
} as const satisfies Record<AnalysisKind, keyof Env>;

const MODEL_KEY = {
  term: "MODEL_TERM",
  sensational: "MODEL_SENSATIONAL",
  quantitative: "MODEL_QUANTITATIVE",
  context: "MODEL_CONTEXT",
} as const satisfies Record<AnalysisKind, keyof Env>;

export function providerFor(env: Env, kind: AnalysisKind): string {
  return env[PROVIDER_KEY[kind]] as string;
}

export function modelFor(env: Env, kind: AnalysisKind): string {
  return env[MODEL_KEY[kind]] as string;
}

export function detectProvider(env: Env): string {
  return env.PROVIDER_DETECT;
}

export function detectModel(env: Env): string {
  return env.MODEL_DETECT;
}

export function auxProvider(env: Env): string {
  return env.PROVIDER_AUX;
}

export function auxModel(env: Env): string {
  return env.MODEL_AUX;
}

export function cacheTtlSec(env: Env): number {
  return Number(env.CACHE_TTL_SEC) || 3600;
}
