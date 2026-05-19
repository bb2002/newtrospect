import type { AIProvider, AnalyzeArgs, AnalyzeResult } from "../provider.ts";
import type { Env } from "../env.ts";
import { PROMPTS } from "../prompts.ts";
import { matchSpans } from "../match-spans.ts";
import type { RawItem } from "../match-spans.ts";

export const workersAIProvider: AIProvider = {
  async analyze(env, args): Promise<AnalyzeResult> {
    const t0 = Date.now();
    const prompt = PROMPTS[args.kind];

    const response = await env.AI.run(args.model as Parameters<Ai["run"]>[0], {
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: args.text },
      ],
      max_tokens: 1024,
      temperature: 0.1,
    }) as { response?: string };

    const raw = response.response ?? "";
    const items = parseItemsLoose(raw);
    const spans = matchSpans(args.text, items, args.kind);
    return { spans, model: args.model, elapsedMs: Date.now() - t0 };
  },
};

/**
 * LLM 출력 파서. 모델이 JSON 만 출력하라고 시켜도 종종 마크다운 펜스 ```json 을 두르거나
 * 앞뒤에 잡설을 붙인다. 첫 '{' 부터 마지막 '}' 까지를 추출해 JSON.parse.
 */
function parseItemsLoose(raw: string): RawItem[] {
  if (!raw) return [];
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first < 0 || last <= first) return [];
  const slice = raw.slice(first, last + 1);
  try {
    const obj = JSON.parse(slice) as { items?: unknown };
    if (!Array.isArray(obj.items)) return [];
    return obj.items.filter((x): x is RawItem =>
      typeof x === "object" && x !== null && typeof (x as RawItem).text === "string",
    );
  } catch {
    return [];
  }
}
