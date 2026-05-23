import { Readability } from "@mozilla/readability";
import { FALLBACK_SELECTORS, SITE_SELECTORS, selectorsForHost } from "./selectors.ts";
import { MIN_BODY_LENGTH } from "./types.ts";

/**
 * 추출 결과 — text 는 좌표계 기준 평문, host 는 통계용.
 * text 가 빈 문자열이거나 MIN_BODY_LENGTH 미만이면 호출 측에서 분석 건너뜀.
 *
 * source: 추출 전략 식별. 'selector' = SITE_SELECTORS 또는 fallback 셀렉터 매치.
 *         'readability' = Mozilla Readability 가 추출한 본문 (셀렉터 결과가 너무 시끄럽거나
 *         dictionary 미등록 사이트일 때).
 */
export interface ExtractResult {
  text: string;
  host: string;
  selectorUsed: string | null;
  source: "selector" | "readability";
}

/**
 * 셀렉터 매치 결과가 이 길이를 넘기면 본문 외 (헤더·푸터·관련글·태그·CTA) 가 같이
 * 잡혔다고 의심하고 Readability fallback 으로 한 번 더 정제 시도. 한국 뉴스 본문은
 * 보통 4~5천자 이내. 6000을 임계값으로.
 */
const NOISE_THRESHOLD_CP = 6000;

/**
 * DOM 기반 본문 추출. 본문 추출은 *클라이언트에서만* (서버 fetch X).
 * 봇 차단·로그인 벽을 자연스럽게 우회한다.
 *
 * 흐름:
 *   1. SITE_SELECTORS 에 등록된 사이트 → 사이트 셀렉터 우선. 너무 크면 Readability fallback.
 *   2. dictionary 없는 사이트 → Readability 1차. 실패하면 FALLBACK_SELECTORS (article/main).
 *
 * 좌표계는 *코드포인트 단위*. matchSpans / highlight 가 동일 단위로 매칭하도록
 * 호출 측이 Array.from 으로 인덱싱해야 한다.
 */
export function extractArticleText(doc: Document, url: string): ExtractResult {
  const host = new URL(url).hostname.toLowerCase();

  if (hasSiteEntry(host)) {
    const candidates = selectorsForHost(host);
    for (const selector of candidates) {
      const el = doc.querySelector(selector);
      if (!el) continue;
      const text = normalize(el.textContent ?? "");
      if (text.length >= MIN_BODY_LENGTH) {
        if (text.length > NOISE_THRESHOLD_CP) {
          const cleaned = readabilityExtract(doc);
          if (cleaned && cleaned.length >= MIN_BODY_LENGTH) {
            return { text: cleaned, host, selectorUsed: selector, source: "readability" };
          }
        }
        return { text, host, selectorUsed: selector, source: "selector" };
      }
    }
  } else {
    const cleaned = readabilityExtract(doc);
    if (cleaned && cleaned.length >= MIN_BODY_LENGTH) {
      return { text: cleaned, host, selectorUsed: null, source: "readability" };
    }
    for (const selector of FALLBACK_SELECTORS) {
      const el = doc.querySelector(selector);
      if (!el) continue;
      const text = normalize(el.textContent ?? "");
      if (text.length >= MIN_BODY_LENGTH) {
        return { text, host, selectorUsed: selector, source: "selector" };
      }
    }
  }

  return { text: "", host, selectorUsed: null, source: "selector" };
}

/**
 * Mozilla Readability — Firefox 리더 모드가 쓰는 엔진. boilerplate (메뉴·푸터·관련글·광고)
 * 를 제거하고 본문 평문을 반환. cloneNode 로 원본 DOM 은 건드리지 않는다.
 */
function readabilityExtract(doc: Document): string | null {
  try {
    const clone = doc.cloneNode(true) as Document;
    const article = new Readability(clone as unknown as Document).parse();
    if (!article || !article.textContent) return null;
    return normalize(article.textContent);
  } catch {
    return null;
  }
}

function hasSiteEntry(host: string): boolean {
  if (SITE_SELECTORS[host]) return true;
  for (const key of Object.keys(SITE_SELECTORS)) {
    if (host.endsWith(key)) return true;
  }
  return false;
}

/** 공백·개행 통합 + trim. 순수 함수 — 동일 입력 → 동일 출력. */
export function normalize(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}
