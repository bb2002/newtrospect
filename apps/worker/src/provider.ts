import type { AnalysisKind, Span } from "@newtrospect/core/server";
import type { Env } from "./env.ts";

export interface AnalyzeArgs {
  kind: AnalysisKind;
  text: string;
  model: string;
}

export interface AnalyzeResult {
  spans: Span[];
  model: string;
  elapsedMs: number;
}

/**
 * 모든 분석 provider 가 따르는 인터페이스.
 * 현 단계는 WorkersAIProvider 하나만 구현. Gemini 는 S2 spike 결과 보고 추가.
 */
export interface AIProvider {
  analyze(env: Env, args: AnalyzeArgs): Promise<AnalyzeResult>;
}
