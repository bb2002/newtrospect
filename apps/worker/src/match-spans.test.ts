import { describe, expect, it } from "vitest";
import { matchSpans, type RawItem } from "./match-spans.ts";

describe("matchSpans", () => {
  const sentence = "한국은행은 기준금리를 3.50%로 동결했다.";

  it("maps a verbatim substring to code-point offsets", () => {
    const items: RawItem[] = [{ text: "기준금리", explanation: "한국은행이 정하는 정책 금리" }];
    const [span] = matchSpans(sentence, items, "term");
    expect(span).toBeDefined();
    const cps = Array.from(sentence);
    const sliced = cps.slice(span!.start, span!.end).join("");
    expect(sliced).toBe("기준금리");
  });

  it("silently drops items whose text is not found verbatim (hallucinations)", () => {
    const items: RawItem[] = [
      { text: "환각된문자열입니다", explanation: "본문에 없음" },
      { text: "한국은행", explanation: "중앙은행" },
    ];
    const spans = matchSpans(sentence, items, "term");
    expect(spans).toHaveLength(1);
    expect(Array.from(sentence).slice(spans[0]!.start, spans[0]!.end).join("")).toBe("한국은행");
  });

  it("returns no span when payload field required by kind is missing", () => {
    // term 은 explanation 이 필수
    const items: RawItem[] = [{ text: "기준금리" /* explanation 빠짐 */ }];
    expect(matchSpans(sentence, items, "term")).toEqual([]);
  });

  it("quantitative falls back to text when searchQuery is missing", () => {
    const items: RawItem[] = [{ text: "3.50%" }];
    const [span] = matchSpans(sentence, items, "quantitative");
    expect(span?.kind).toBe("quantitative");
    if (span?.kind === "quantitative") {
      expect(span.payload.searchQuery).toBe("3.50%");
    }
  });

  it("context spans never need a payload field", () => {
    const items: RawItem[] = [{ text: sentence }];
    const [span] = matchSpans(sentence, items, "context");
    expect(span).toBeDefined();
    expect(span!.start).toBe(0);
    expect(span!.end).toBe(Array.from(sentence).length);
  });

  it("dedupes identical (start, end, kind) tuples", () => {
    const items: RawItem[] = [
      { text: "기준금리", explanation: "1" },
      { text: "기준금리", explanation: "2" },
    ];
    const spans = matchSpans(sentence, items, "term");
    expect(spans).toHaveLength(1);
  });

  it("ignores empty-string item.text", () => {
    const items: RawItem[] = [{ text: "", explanation: "x" }];
    expect(matchSpans(sentence, items, "term")).toEqual([]);
  });

  it("returns code-point offsets even when text contains supplementary-plane chars", () => {
    const text = "결과: 📈 12.4% 증가";
    const items: RawItem[] = [{ text: "12.4% 증가" }];
    const [span] = matchSpans(text, items, "quantitative");
    expect(span).toBeDefined();
    const cps = Array.from(text);
    expect(cps.slice(span!.start, span!.end).join("")).toBe("12.4% 증가");
  });
});
