/**
 * 사이트별 본문 셀렉터 dictionary.
 *
 * ⚠️ 모두 *짐작값*이다. 과제 1(셀렉터 실측)에서 사용자가 직접
 * DevTools 로 확인 후 교체할 것. 실측 결과는 디자인 문서
 * Spike Results 섹션에 기록되며, 그 값으로 이 객체를 덮어쓴다.
 *
 * 우선순위: 사이트 dictionary → <article> 폴백 → 둘 다 실패 시 비활성.
 */
export const SITE_SELECTORS: Record<string, readonly string[]> = {
  "news.naver.com": ["#dic_area", "#newsct_article"],
  "n.news.naver.com": ["#dic_area", "#newsct_article"],
  "news.daum.net": [".article_view", '[data-cloudid="news.read"]'],
  "v.daum.net": [".article_view"],
  "chosun.com": [".article-body", "#news_body_id"],
  "joongang.co.kr": ["#article_body"],
  "hani.co.kr": [".article-text"],
};

export const FALLBACK_SELECTORS: readonly string[] = ["article", "main article"];

/** 호스트네임으로 셀렉터 후보 리스트 결정. dictionary → fallback 순서. */
export function selectorsForHost(host: string): readonly string[] {
  const normalized = host.toLowerCase();
  const direct = SITE_SELECTORS[normalized];
  if (direct) return [...direct, ...FALLBACK_SELECTORS];
  for (const key of Object.keys(SITE_SELECTORS)) {
    if (normalized.endsWith(key)) {
      return [...SITE_SELECTORS[key]!, ...FALLBACK_SELECTORS];
    }
  }
  return FALLBACK_SELECTORS;
}
