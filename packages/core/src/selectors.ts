/**
 * 사이트별 본문 셀렉터 dictionary.
 *
 * ⚠️ 이 값들은 *공개 자료 기반 추정값* 이다. 실측해서 맞지 않으면 갱신해주세요.
 * 작업 흐름:
 *   1. 해당 사이트 기사 페이지를 연다
 *   2. DevTools Elements 탭에서 본문을 정확히 감싸는 가장 작은 컨테이너 선택
 *   3. 그 셀렉터로 본 dictionary 항목 교체
 *   4. 디자인 문서 Spike Results 의 "셀렉터 실측" 항목에 기록
 *
 * 우선순위: 사이트 dictionary → schema.org articleBody → <article> → <main article>.
 * 둘 다 실패하면 본문 추출 비활성화 → 익스텐션이 조용히 종료.
 *
 * 키: 호스트네임 끝부분 매칭. e.g. `joongang.co.kr` 키는 `news.joongang.co.kr` 에도 매칭.
 */
export const SITE_SELECTORS: Record<string, readonly string[]> = {
  // 포털
  "news.naver.com": ["#dic_area", "#newsct_article", "#articleBodyContents"],
  "n.news.naver.com": ["#dic_area", "#newsct_article"],
  "news.daum.net": ["#harmonyContainer", ".article_view"],
  "v.daum.net": ["#harmonyContainer", ".article_view"],

  // 종합지
  "chosun.com": [".article-body", "#news_body_id", ".news_text"],
  "joongang.co.kr": ["#article_body", ".article_body"],
  "donga.com": [".article_txt", ".news_view"],
  "hani.co.kr": [".article-text", ".text"],
  "khan.co.kr": ["#articleBody", ".art_body"],
  "hankookilbo.com": [".article-story"],
  "seoul.co.kr": ["#articleContent", ".viewContent"],
  "kmib.co.kr": ["#articleBody"],
  "segye.com": ["#article_txt"],

  // 경제지
  "hankyung.com": ["#articletxt", ".article-body"],
  "mk.co.kr": [".view_txt", "#artText"],
  "mt.co.kr": ["#textBody", ".view_txt"],
  "edaily.co.kr": [".news_body", "#newsBody"],
  "fnnews.com": ["#article_content"],
  "asiae.co.kr": ["#txt_area", ".article"],

  // 방송
  "news.kbs.co.kr": ["#cont_newstext", ".detail-body"],
  "news.sbs.co.kr": [".text_area", "#etv_news_content_div"],
  "imnews.imbc.com": [".news_txt"],
  "ytn.co.kr": [".paragraph", "#CmAdContent"],
  "jtbc.co.kr": ["#articlebody .article_content"],

  // 통신·기타
  "yna.co.kr": [".story-news", "#articleWrap"],
  "ohmynews.com": [".at_contents"],
  "nocutnews.co.kr": ["#pnlContent"],
  "pressian.com": ["#article_body"],
  "newstapa.org": [".bodytext"],
};

/**
 * 사이트 dictionary 가 없을 때의 폴백.
 * `[itemprop="articleBody"]` 는 schema.org Article 마크업의 표준이라 의외로 많이 맞춤.
 */
export const FALLBACK_SELECTORS: readonly string[] = [
  '[itemprop="articleBody"]',
  "article",
  "main article",
  "main",
];

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
