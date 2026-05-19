/**
 * span.start / span.end 는 유니코드 *코드포인트* 오프셋이다.
 * UTF-16 code unit 이 아니라는 점에 주의 — 이모지·서로게이트 페어가
 * 한국 뉴스 본문에 거의 없긴 하지만, 서버·클라이언트가 동일한 단위를
 * 쓰지 않으면 좌표가 어긋난다. 본문 처리 시 항상 Array.from(text)
 * 또는 [...text] 로 코드포인트 단위로 분해해 인덱싱한다.
 */

export type AnalysisKind = "term" | "sensational" | "quantitative" | "context";

export interface SpanBase {
  start: number;
  end: number;
  kind: AnalysisKind;
}

export interface TermSpan extends SpanBase {
  kind: "term";
  payload: { explanation: string };
}

export interface SensationalSpan extends SpanBase {
  kind: "sensational";
  payload: { reason: string };
}

export interface QuantitativeSpan extends SpanBase {
  kind: "quantitative";
  payload: { searchQuery: string };
}

export interface ContextSpan extends SpanBase {
  kind: "context";
  payload: Record<string, never>;
}

export type Span = TermSpan | SensationalSpan | QuantitativeSpan | ContextSpan;

export interface AnalyzeRequest {
  text: string;
  lang: "ko";
}

export interface AnalyzeResponse<S extends Span = Span> {
  spans: S[];
  model: string;
  elapsedMs: number;
  cached?: boolean;
}

export interface DetectArticleRequest {
  text: string;
  url?: string;
}

export interface DetectArticleResponse {
  isArticle: boolean;
  cleanedText: string;
  reason?: string;
}

/** 200자 미만은 단신·페이월·로그인 벽으로 간주 → 분석 안 함. */
export const MIN_BODY_LENGTH = 200;

export const ANALYZE_ENDPOINTS = {
  term: "/api/analyze/terms",
  sensational: "/api/analyze/sensational",
  quantitative: "/api/analyze/quantitative",
  context: "/api/analyze/context",
} as const satisfies Record<AnalysisKind, string>;
