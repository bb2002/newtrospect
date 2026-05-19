import type { AnalysisKind, Span } from "@newtrospect/core/server";

/**
 * 모델이 출력한 "원문 부분 문자열" + payload 키 → 본문 내 코드포인트 오프셋 span 으로 변환.
 *
 * 좌표계는 *코드포인트 단위*. JS 의 String#indexOf 는 UTF-16 코드 유닛 기준이라
 * 그대로 쓰면 안 된다. 본문을 Array.from 으로 코드포인트 배열로 분해해
 * 일관된 단위로 검색한다.
 *
 * - 같은 부분 문자열이 본문에 여러 번 등장하면 *처음 등장* 1회만 매핑.
 *   여러 곳을 마킹하려면 모델이 동일 문자열을 여러 번 출력하게 해야 한다.
 *   (현 단계에선 단순함 우선 — 추후 LCS 매칭으로 확장 가능.)
 * - 본문에 없는 (모델이 환각한) 문자열은 조용히 버린다.
 */
export interface RawItem {
  text: string;
  [key: string]: unknown;
}

export function matchSpans(
  text: string,
  items: RawItem[],
  kind: AnalysisKind,
): Span[] {
  const cps = Array.from(text);
  const out: Span[] = [];
  for (const item of items) {
    if (typeof item.text !== "string" || item.text.length === 0) continue;
    const targetCps = Array.from(item.text);
    const idx = findSubarray(cps, targetCps);
    if (idx < 0) continue;
    const start = idx;
    const end = idx + targetCps.length;

    switch (kind) {
      case "term": {
        const explanation = typeof item.explanation === "string" ? item.explanation : "";
        if (!explanation) continue;
        out.push({ kind, start, end, payload: { explanation } });
        break;
      }
      case "sensational": {
        const reason = typeof item.reason === "string" ? item.reason : "";
        if (!reason) continue;
        out.push({ kind, start, end, payload: { reason } });
        break;
      }
      case "quantitative": {
        const searchQuery = typeof item.searchQuery === "string" ? item.searchQuery : item.text;
        out.push({ kind, start, end, payload: { searchQuery } });
        break;
      }
      case "context": {
        out.push({ kind, start, end, payload: {} });
        break;
      }
    }
  }
  return dedupe(out);
}

function findSubarray<T>(hay: readonly T[], needle: readonly T[]): number {
  if (needle.length === 0 || hay.length < needle.length) return -1;
  outer: for (let i = 0; i <= hay.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (hay[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/** 동일 (start,end,kind) 는 한 번만. */
function dedupe(spans: Span[]): Span[] {
  const seen = new Set<string>();
  const out: Span[] = [];
  for (const s of spans) {
    const key = `${s.kind}:${s.start}:${s.end}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}
