import type {
  AnalysisKind,
  AnalyzeResponse,
  CharacterResponse,
  DetectArticleResponse,
  RewriteSensationalResponse,
  Span,
  SummaryResponse,
} from "./types.ts";
import {
  ANALYZE_ENDPOINTS,
  CHARACTER_ENDPOINT,
  REWRITE_SENSATIONAL_ENDPOINT,
  SUMMARY_ENDPOINT,
} from "./types.ts";

export interface ClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
  signal?: AbortSignal;
}

export class NewtrospectClient {
  constructor(private readonly opts: ClientOptions) {}

  async detectArticle(text: string, url?: string): Promise<DetectArticleResponse> {
    return this.post<DetectArticleResponse>("/api/detect-article", { text, url });
  }

  async analyze(
    kind: AnalysisKind,
    text: string,
  ): Promise<AnalyzeResponse> {
    return this.post<AnalyzeResponse>(ANALYZE_ENDPOINTS[kind], { text, lang: "ko" });
  }

  /**
   * 4개 분석을 병렬 호출. allSettled 라 일부 실패해도 나머지는 렌더된다.
   * 호출 측은 status === "fulfilled" 인 결과만 렌더하면 된다.
   */
  async analyzeAll(text: string): Promise<Record<AnalysisKind, PromiseSettledResult<AnalyzeResponse<Span>>>> {
    const kinds: AnalysisKind[] = ["term", "sensational", "quantitative", "context"];
    const results = await Promise.allSettled(kinds.map((k) => this.analyze(k, text)));
    const map = {} as Record<AnalysisKind, PromiseSettledResult<AnalyzeResponse<Span>>>;
    kinds.forEach((k, i) => {
      map[k] = results[i]!;
    });
    return map;
  }

  /** 한줄정리 + 3장 카드 (specs/01). */
  async summary(text: string): Promise<SummaryResponse> {
    return this.post<SummaryResponse>(SUMMARY_ENDPOINT, { text, lang: "ko" });
  }

  /** 글 성격 7신호 (specs/04). */
  async character(text: string): Promise<CharacterResponse> {
    return this.post<CharacterResponse>(CHARACTER_ENDPOINT, { text, lang: "ko" });
  }

  /** 자극적 문장을 온화한 표현으로 변환 (specs/03). */
  async rewriteSensational(text: string, reason?: string): Promise<RewriteSensationalResponse> {
    return this.post<RewriteSensationalResponse>(REWRITE_SENSATIONAL_ENDPOINT, { text, reason });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const f = this.opts.fetch ?? fetch;
    const res = await f(`${this.opts.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: this.opts.signal,
    });
    if (!res.ok) {
      throw new Error(`${path} ${res.status}`);
    }
    return (await res.json()) as T;
  }
}
