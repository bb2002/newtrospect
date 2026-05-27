import type { AnalysisKind, Span } from "@newtrospect/core/server";
import { attachMarkClickHandler } from "./popover";

/**
 * DOM 하이라이트. extension content/highlight.ts 와 *의도적으로 동일* 로직.
 *
 * 우선순위 (specs/02): 노랑(context) < 빨강(sensational) < (파랑 term, 초록 quantitative).
 * - 파랑/초록 동시 후보면 파랑(term) 우선
 * - 한 위치에 여러 종류가 겹치면 시각·툴팁 모두 우선순위 최고 1개만 노출
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
 * inline spans → non-overlapping segments. extension highlight.ts 미러.
 * term+quantitative 부분 겹침 시 비-겹친 quantitative 영역이 *초록으로 살아남도록*.
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

  // Pass 1: context wrap. payload 에 겹치는 inline spans 도 저장 (CLAUDE.md 회귀 금지).
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

  // Pass 2: inline 강조 — interval segmentation (term+quantitative 비-겹친 영역 보존).
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
    // 각 mark 에 직접 click/touchend listener 단단 — WebView click 합성 누락 대비.
    attachMarkClickHandler(wrap);
    try {
      range.surroundContents(wrap);
    } catch {
      // partial coverage 실패 시 splitText fallback.
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
