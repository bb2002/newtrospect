import { describe, expect, it } from "vitest";
import { normalize } from "./extract.ts";

describe("normalize", () => {
  it("collapses consecutive whitespace into single space", () => {
    expect(normalize("a   b\t\nc")).toBe("a b c");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalize("  hello  ")).toBe("hello");
  });

  it("is deterministic — same input → same output", () => {
    const sample = "  뉴스 본문  여러   공백\n\n과   개행  ";
    expect(normalize(sample)).toBe(normalize(sample));
  });

  it("handles empty input", () => {
    expect(normalize("")).toBe("");
    expect(normalize("   \n\n   ")).toBe("");
  });

  it("preserves Korean characters and code-point boundaries", () => {
    expect(normalize("안녕\n하세요")).toBe("안녕 하세요");
  });
});
