import type { AnalysisKind, Span } from "@newtrospect/core/server";

/**
 * DOM 하이라이트 적용.
 *
 * 좌표계: span.start/end 는 root.textContent 의 *코드포인트* 오프셋.
 * root.textContent 와 본문 텍스트 추출에 사용된 텍스트가 동일해야 좌표가 맞는다.
 * (= 추출 시 normalize 를 trim 정도로만 했고, 그 trim 된 시작점부터의 인덱스다.)
 *
 * 알고리즘: TreeWalker 로 Text 노드를 순회하면서 누적 코드포인트 오프셋을 추적,
 * span 경계에 도달하면 Range 로 wrap.
 *
 * 겹침 처리: 우선순위 (빨강 > 초록 > 파랑 > 노랑) 가장 높은 색이 *배경*,
 * 나머지는 *밑줄/테두리*. 본 cut 에선 단순화 — 가장 높은 우선순위 1색만 wrap,
 * 툴팁에 모든 분석 결과 누적.
 */

const PRIORITY: Record<AnalysisKind, number> = {
  sensational: 0,
  quantitative: 1,
  term: 2,
  context: 3,
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

/** 동일 텍스트 영역에 겹치는 span 을 묶고, 시각적으로 적용할 1개 색을 정한다. */
function mergeOverlaps(spans: Span[]): MergedMark[] {
  if (spans.length === 0) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: MergedMark[] = [];

  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) {
      last.end = Math.max(last.end, s.end);
      last.all.push(s);
      if (PRIORITY[s.kind] < PRIORITY[last.primary]) last.primary = s.kind;
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

/** root 안의 Text 노드들을 누적 코드포인트 오프셋과 함께 수집. */
function collectTextPieces(root: Element): { pieces: TextPiece[]; total: number } {
  const pieces: TextPiece[] = [];
  let offset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeValue && n.nodeValue.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
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

/** 한 piece 안의 [pieceStart..pieceEnd) 코드포인트 구간을 UTF-16 offset 으로 변환. */
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
  const merged = mergeOverlaps(spans);
  if (merged.length === 0) return;
  const { pieces } = collectTextPieces(root);

  // 끝에서부터 적용 — 앞쪽 마킹이 뒷 좌표를 흔들지 않도록.
  for (const mark of merged.slice().reverse()) {
    applyMark(pieces, mark);
  }
}

function applyMark(pieces: TextPiece[], mark: MergedMark): void {
  // mark 구간이 어떤 piece(들) 에 걸치는지 찾기
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
    wrap.dataset.kinds = mark.all.map((s) => s.kind).join(",");
    wrap.title = buildTooltip(mark);
    try {
      range.surroundContents(wrap);
    } catch {
      // partial coverage (Range crosses element boundary) — 본 cut 에선 스킵
    }
  }
}

function buildTooltip(mark: MergedMark): string {
  return mark.all
    .map((s) => {
      switch (s.kind) {
        case "term": return `용어: ${s.payload.explanation}`;
        case "sensational": return `자극: ${s.payload.reason}`;
        case "quantitative": return `수치 — 검색: ${s.payload.searchQuery}`;
        case "context": return "핵심 문맥";
      }
    })
    .join("\n");
}
