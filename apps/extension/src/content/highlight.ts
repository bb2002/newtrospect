import type { AnalysisKind, Span } from "@newtrospect/core/server";
import { attachMarkClickHandler } from "./popover.ts";

/**
 * DOM 하이라이트 적용.
 *
 * 좌표계: span.start/end 는 root.textContent 의 *코드포인트* 오프셋.
 * root.textContent 와 본문 텍스트 추출에 사용된 텍스트가 동일해야 좌표가 맞는다.
 *
 * 알고리즘: TreeWalker 로 Text 노드를 순회하면서 누적 코드포인트 오프셋을 추적,
 * span 경계에 도달하면 Range 로 wrap.
 *
 * 두-패스 레이어링:
 *   1. context (노란색) 먼저 wrap — 문장 단위 배경.
 *   2. 그 위에 sensational/quantitative/term inline wrap.
 *   이렇게 해야 노란 형광펜 위에 다른 강조가 *덮이지 않고 공존* 한다.
 *   ※ context wrap 이후엔 text node 가 split 되니, 2 패스에서 pieces 를 재수집.
 *
 * 데이터 보존: 각 nts-mark 에 data-payload(JSON 직렬화된 Span[]) 를 부착해
 *   popover 가 클릭 시 그 자리에서 종류별 표시를 만들 수 있게 한다.
 */

/**
 * 우선순위: 노랑(context) < 빨강(sensational) < (파랑 term, 초록 quantitative)
 * - 파랑/초록 동시 후보면 파랑(term) 우선
 * - 한 위치에 여러 종류가 겹치면 시각·툴팁 모두 우선순위 최고 1개만 노출
 * (사양: specs/02-하이라이트고도화.md)
 */
const INLINE_PRIORITY: Record<Exclude<AnalysisKind, "context">, number> = {
  term: 0,
  quantitative: 1,
  sensational: 2,
};

export const HIGHLIGHT_CLASS: Record<AnalysisKind, string> = {
  term: "nts-term",
  sensational: "nts-sensational",
  quantitative: "nts-quantitative",
  context: "nts-context",
};

interface MergedMark {
  start: number;
  end: number;
  primary: AnalysisKind;
  all: Span[];
}

/**
 * inline spans 를 *겹친 영역과 비-겹친 영역을 분리* 한 non-overlapping segments 로 변환.
 *
 * 이전 mergeInlineOverlaps 가 *flat merge* 라 term[10-15] + quantitative[10-25] 가 들어오면
 * 합쳐서 [10-25] 전부 term 색(파랑) — quantitative 의 비-겹친 [15-25] 부분도 파랑으로 덮여서
 * *초록이 전혀 안 보임* 버그가 있었음 (2026-05-26).
 *
 * 새 방식: 모든 boundary 로 잘라 segment 별로 primary 결정.
 *   - [10-15]: term + quantitative → primary=term (파랑, 사용자 결정)
 *   - [15-25]: quantitative 만 → primary=quantitative (초록 살아남)
 */
function segmentInlineSpans(spans: Span[]): MergedMark[] {
  if (spans.length === 0) return [];
  const boundaries = new Set<number>();
  for (const s of spans) {
    boundaries.add(s.start);
    boundaries.add(s.end);
  }
  const sorted = Array.from(boundaries).sort((a, b) => a - b);
  const segments: MergedMark[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i]!;
    const segEnd = sorted[i + 1]!;
    if (segStart >= segEnd) continue;
    const overlapping = spans.filter((s) => s.start < segEnd && s.end > segStart);
    if (overlapping.length === 0) continue;
    let primary: AnalysisKind = overlapping[0]!.kind;
    for (const s of overlapping) {
      if (s.kind === "context" || primary === "context") continue;
      const sp = INLINE_PRIORITY[s.kind as Exclude<AnalysisKind, "context">];
      const pp = INLINE_PRIORITY[primary as Exclude<AnalysisKind, "context">];
      if (sp < pp) primary = s.kind;
    }
    segments.push({ start: segStart, end: segEnd, primary, all: overlapping });
  }
  return segments;
}

/** context spans 용 — 단순 flat merge (단일 색 배경/밑줄이라 합쳐도 무방). */
function mergeContextOverlaps(spans: Span[]): MergedMark[] {
  if (spans.length === 0) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: MergedMark[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
      last.all.push(s);
    } else {
      out.push({ start: s.start, end: s.end, primary: s.kind, all: [s] });
    }
  }
  return out;
}

interface TextPiece {
  node: Text;
  start: number;
  end: number;
}

function collectTextPieces(root: Element): { pieces: TextPiece[]; total: number } {
  const pieces: TextPiece[] = [];
  let offset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.nodeValue && n.nodeValue.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  let node: Node | null = walker.nextNode();
  while (node) {
    const text = node.nodeValue ?? "";
    const cpLen = Array.from(text).length;
    pieces.push({ node: node as Text, start: offset, end: offset + cpLen });
    offset += cpLen;
    node = walker.nextNode();
  }
  return { pieces, total: offset };
}

function cpRangeToUtf16(text: string, cpStart: number, cpEnd: number): { start: number; end: number } {
  let utf16Start = 0;
  let utf16End = 0;
  let cp = 0;
  for (let i = 0; i < text.length; ) {
    if (cp === cpStart) utf16Start = i;
    if (cp === cpEnd) {
      utf16End = i;
      return { start: utf16Start, end: utf16End };
    }
    const code = text.codePointAt(i)!;
    i += code > 0xffff ? 2 : 1;
    cp++;
  }
  if (cp === cpEnd) utf16End = text.length;
  if (cp === cpStart) utf16Start = text.length;
  return { start: utf16Start, end: utf16End };
}

export function applyHighlights(root: Element, spans: Span[]): void {
  const contextSpans = spans.filter((s): s is Extract<Span, { kind: "context" }> => s.kind === "context");
  const inlineSpans = spans.filter((s) => s.kind !== "context");

  // Pass 1: context (bold+밑줄) wrap. payload 에 겹치는 inline spans 도 저장 — Pass 2 wrap 이
  // 실패해도 click 이 context 에 떨어지면 popover 정상 (CLAUDE.md 절대 회귀 금지 참고).
  if (contextSpans.length > 0) {
    const merged = mergeContextOverlaps(contextSpans);
    for (const mark of merged) {
      for (const inline of inlineSpans) {
        if (inline.start < mark.end && inline.end > mark.start) {
          mark.all.push(inline);
        }
      }
    }
    const { pieces } = collectTextPieces(root);
    for (const mark of merged.slice().reverse()) applyMark(pieces, mark);
  }

  // Pass 2: inline 강조 — *interval segmentation* 으로 겹친/비-겹친 영역 정확히 분리.
  // term+quantitative 부분 겹침 시 겹친 부분만 파랑, 비-겹친 quantitative 부분은 초록 유지.
  if (inlineSpans.length > 0) {
    const segments = segmentInlineSpans(inlineSpans);
    const { pieces } = collectTextPieces(root);
    for (const mark of segments.slice().reverse()) applyMark(pieces, mark);
  }
}

function applyMark(pieces: TextPiece[], mark: MergedMark): void {
  const overlapping = pieces.filter((p) => p.start < mark.end && p.end > mark.start);
  if (overlapping.length === 0) return;

  for (const piece of overlapping) {
    const localCpStart = Math.max(0, mark.start - piece.start);
    const localCpEnd = Math.min(piece.end - piece.start, mark.end - piece.start);
    if (localCpEnd <= localCpStart) continue;

    const text = piece.node.nodeValue ?? "";
    const { start, end } = cpRangeToUtf16(text, localCpStart, localCpEnd);
    if (end <= start) continue;

    const range = document.createRange();
    try {
      range.setStart(piece.node, start);
      range.setEnd(piece.node, end);
    } catch {
      continue;
    }
    const wrap = document.createElement("nts-mark");
    wrap.className = HIGHLIGHT_CLASS[mark.primary];
    wrap.dataset.kinds = Array.from(new Set(mark.all.map((s) => s.kind))).join(",");
    wrap.dataset.payload = JSON.stringify(mark.all);
    // 각 mark 에 직접 click/touch listener 단단 — document delegation 의 한계 우회.
    attachMarkClickHandler(wrap);
    try {
      range.surroundContents(wrap);
    } catch {
      // surroundContents 가 partial coverage 로 실패하는 케이스 — splitText 방식으로 fallback.
      // 같은 text 노드 내부 일부분이면 안전하게 split → 가운데 조각을 wrap 안에 넣음.
      if (
        range.startContainer === range.endContainer &&
        range.startContainer.nodeType === Node.TEXT_NODE
      ) {
        const textNode = range.startContainer as Text;
        const startOff = range.startOffset;
        const endOff = range.endOffset;
        const target = textNode.splitText(startOff);
        target.splitText(endOff - startOff);
        const parent = target.parentNode;
        if (parent) {
          parent.insertBefore(wrap, target);
          wrap.appendChild(target);
        }
      }
    }
  }
}
