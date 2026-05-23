import type { AnalysisKind, Span } from "@newtrospect/core/server";

/**
 * DOM 하이라이트. extension content/highlight.ts 와 *의도적으로 동일* 로직.
 */

const INLINE_PRIORITY: Record<Exclude<AnalysisKind, "context">, number> = {
  sensational: 0,
  quantitative: 1,
  term: 2,
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

function mergeInlineOverlaps(spans: Span[]): MergedMark[] {
  if (spans.length === 0) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: MergedMark[] = [];

  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
      last.all.push(s);
      if (s.kind !== "context" && last.primary !== "context") {
        const sp = INLINE_PRIORITY[s.kind as Exclude<AnalysisKind, "context">];
        const lp = INLINE_PRIORITY[last.primary as Exclude<AnalysisKind, "context">];
        if (sp < lp) last.primary = s.kind;
      }
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

  if (contextSpans.length > 0) {
    const merged = mergeInlineOverlaps(contextSpans);
    const { pieces } = collectTextPieces(root);
    for (const mark of merged.slice().reverse()) applyMark(pieces, mark);
  }

  if (inlineSpans.length > 0) {
    const merged = mergeInlineOverlaps(inlineSpans);
    const { pieces } = collectTextPieces(root);
    for (const mark of merged.slice().reverse()) applyMark(pieces, mark);
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
    try {
      range.surroundContents(wrap);
    } catch {
      // partial coverage (Range crosses element boundary) — 스킵
    }
  }
}
