import { describe, expect, it } from "vitest";
import { FALLBACK_SELECTORS, SITE_SELECTORS, selectorsForHost } from "./selectors.ts";

describe("selectorsForHost", () => {
  it("returns site-specific selectors then fallbacks for direct hostname match", () => {
    const got = selectorsForHost("news.naver.com");
    const direct = SITE_SELECTORS["news.naver.com"]!;
    expect(got.slice(0, direct.length)).toEqual([...direct]);
    expect(got.slice(direct.length)).toEqual([...FALLBACK_SELECTORS]);
  });

  it("lowercases the host before matching", () => {
    const lower = selectorsForHost("NEWS.NAVER.COM");
    expect(lower).toEqual(selectorsForHost("news.naver.com"));
  });

  it("matches by suffix when subdomain is not in dictionary", () => {
    // dictionary 에 chosun.com 만 있는데 sub.chosun.com 으로 들어와도 매칭돼야 한다
    const got = selectorsForHost("sub.chosun.com");
    const direct = SITE_SELECTORS["chosun.com"]!;
    expect(got.slice(0, direct.length)).toEqual([...direct]);
  });

  it("returns only fallbacks for unknown host", () => {
    const got = selectorsForHost("totally-unknown-host.example");
    expect(got).toEqual([...FALLBACK_SELECTORS]);
  });

  it("fallbacks include schema.org articleBody and <article>", () => {
    expect(FALLBACK_SELECTORS).toContain('[itemprop="articleBody"]');
    expect(FALLBACK_SELECTORS).toContain("article");
  });
});
