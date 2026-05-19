import { selectorsForHost } from "./selectors.ts";
import { MIN_BODY_LENGTH } from "./types.ts";

/**
 * 추출 결과 — text 는 좌표계 기준 평문, host 는 통계용.
 * text 가 빈 문자열이거나 MIN_BODY_LENGTH 미만이면 호출 측에서 분석 건너뜀.
 */
export interface ExtractResult {
  text: string;
  host: string;
  selectorUsed: string | null;
}

/**
 * DOM 기반 본문 추출. 본문 추출은 *클라이언트에서만* (서버 fetch X).
 * 봇 차단·로그인 벽을 자연스럽게 우회한다.
 *
 * 동일 평문에 대해 동일 좌표가 나오도록 결정적 정규화를 거친다:
 * - 모든 후손 textContent 수집
 * - 연속 공백·개행을 단일 공백으로 통합
 * - 양끝 trim
 *
 * 좌표계는 *코드포인트 단위*. 호출 측이 인덱싱할 때 Array.from 으로
 * 분해해야 멀티바이트 문자에서 어긋나지 않는다.
 */
export function extractArticleText(doc: Document, url: string): ExtractResult {
  const host = new URL(url).hostname;
  const candidates = selectorsForHost(host);

  for (const selector of candidates) {
    const el = doc.querySelector(selector);
    if (!el) continue;
    const text = normalize(el.textContent ?? "");
    if (text.length >= MIN_BODY_LENGTH) {
      return { text, host, selectorUsed: selector };
    }
  }
  return { text: "", host, selectorUsed: null };
}

/** 공백·개행 통합 + trim. 순수 함수 — 동일 입력 → 동일 출력. */
export function normalize(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}
