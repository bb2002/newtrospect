/**
 * 하이라이트 탭 시 뜨는 popover. extension content/popover.ts 미러.
 * 모바일 차이:
 *   - hover 없음 → tap 토글
 *   - max-width 280px
 *   - 검색은 같은 탭 이동 (window.location.href)
 */
import type { AnalysisKind, Span } from "@newtrospect/core/server";

const POPOVER_ID = "nts-popover";
const STYLE_ID = "nts-popover-styles";

/**
 * popover 표시 우선순위 — highlight.ts 와 동일 규칙.
 * 한 mark 에 여러 분석이 겹쳤을 때 *최우선 1개*만 렌더.
 * 노랑(context) < 빨강(sensational) < (파랑 term, 초록 quantitative). 파랑 우선.
 */
const POPOVER_PRIORITY: Record<Exclude<AnalysisKind, "context">, number> = {
  term: 0,
  quantitative: 1,
  sensational: 2,
};

/**
 * popover 외부 의존성 주입.
 * rewriteSensational: specs/03 — 빨간 popover 의 '온화한 표현으로 보기' 버튼이 호출.
 */
export interface PopoverOptions {
  rewriteSensational(text: string, reason?: string): Promise<string>;
}

let popoverOpts: PopoverOptions | null = null;
let currentTarget: HTMLElement | null = null;

/**
 * popover 시스템 초기화 — opts 만 주입. click listener 는 *각 nts-mark element 에*
 * 직접 단단 (attachMarkClickHandler). 모바일 WebView 에서 document delegation·click 합성이
 * 깨지는 케이스 다 우회. touchend 도 함께 단단 — Android WebView 클릭 누락 대비.
 */
export function setupPopovers(opts: PopoverOptions): void {
  popoverOpts = opts;
  ensureStyles();
  document.removeEventListener("click", onDocClick);
  document.addEventListener("click", onDocClick);
}

export function attachMarkClickHandler(el: HTMLElement): void {
  el.addEventListener("click", onMarkInteract);
  el.addEventListener("touchend", onMarkInteract, { passive: false });
}

let lastHandledTs = 0;
function onMarkInteract(ev: Event): void {
  const now = Date.now();
  if (now - lastHandledTs < 300) return;
  lastHandledTs = now;

  const target = ev.currentTarget as HTMLElement;
  ev.stopPropagation();
  ev.preventDefault();

  if (currentTarget === target) {
    hidePopover();
    return;
  }
  showPopover(target);
}

function onDocClick(ev: MouseEvent): void {
  const t = ev.target as HTMLElement | null;
  if (!t) return;
  if (t.closest("nts-mark") || t.closest(`#${POPOVER_ID}`)) return;
  hidePopover();
}

/** @deprecated setupPopovers + attachMarkClickHandler 사용. */
export function bindPopovers(_root: Element, opts: PopoverOptions): void {
  setupPopovers(opts);
}

function showPopover(target: HTMLElement): void {
  const dataJson = target.dataset.payload;
  if (!dataJson) {
    hidePopover();
    return;
  }
  let spans: Span[] = [];
  try {
    spans = JSON.parse(dataJson) as Span[];
  } catch {
    hidePopover();
    return;
  }

  const interactive = spans.filter((s) => s.kind !== "context");
  if (interactive.length === 0) {
    hidePopover();
    return;
  }

  // 사양: 한 영역에 여러 분석이 겹치면 우선순위 최고 1개만 렌더 (specs/02)
  const primary = [...interactive].sort(
    (a, b) =>
      POPOVER_PRIORITY[a.kind as Exclude<AnalysisKind, "context">] -
      POPOVER_PRIORITY[b.kind as Exclude<AnalysisKind, "context">],
  )[0]!;

  const pop = ensurePopover();
  pop.innerHTML = renderSection(primary);
  pop.style.display = "block";
  position(pop, target);
  currentTarget = target;

  // 검색 버튼: 모바일은 같은 탭 이동 (새 탭 X)
  pop.querySelectorAll<HTMLElement>("[data-search]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const q = btn.dataset.search!;
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    });
  });

  // specs/03 — 자극적 표현 popover 의 '온화한 표현으로 보기' 버튼.
  if (primary.kind === "sensational") {
    const btn = pop.querySelector<HTMLButtonElement>(".nts-pop-rewrite");
    if (btn && popoverOpts) {
      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        await handleRewriteClick(pop, btn, target, primary.payload.reason);
      });
    }
  }
}

async function handleRewriteClick(
  pop: HTMLElement,
  btn: HTMLButtonElement,
  target: HTMLElement,
  reason: string,
): Promise<void> {
  if (!popoverOpts) return;
  const original = (target.textContent ?? "").trim();
  if (!original) return;

  btn.disabled = true;
  btn.textContent = "변환 중...";

  const resultBox = document.createElement("div");
  resultBox.className = "nts-pop-rewrite-result";
  resultBox.innerHTML = `<div class="nts-pop-rewrite-label">온화한 표현</div><div class="nts-pop-rewrite-body">변환 중...</div>`;
  btn.insertAdjacentElement("afterend", resultBox);

  try {
    const rewritten = await popoverOpts.rewriteSensational(original, reason);
    const body = resultBox.querySelector(".nts-pop-rewrite-body");
    if (body) body.textContent = rewritten || "(변환 결과 없음)";
    btn.remove();
  } catch {
    const body = resultBox.querySelector(".nts-pop-rewrite-body");
    if (body) body.textContent = "변환 실패 — 잠시 후 다시 시도해 주세요.";
    btn.disabled = false;
    btn.textContent = "온화한 표현으로 보기";
  } finally {
    position(pop, target);
  }
}

function renderSection(s: Span): string {
  switch (s.kind) {
    case "term":
      return `<div class="nts-pop-section nts-pop-term">
        <div class="nts-pop-label">용어</div>
        <div class="nts-pop-body">${escapeHtml(s.payload.explanation)}</div>
      </div>`;
    case "sensational":
      return `<div class="nts-pop-section nts-pop-sensational">
        <div class="nts-pop-label">⚠ 자극적 표현</div>
        <div class="nts-pop-body">${escapeHtml(s.payload.reason)}</div>
        <button type="button" class="nts-pop-rewrite">온화한 표현으로 보기</button>
      </div>`;
    case "quantitative": {
      const q = s.payload.searchQuery;
      return `<div class="nts-pop-section nts-pop-quantitative">
        <div class="nts-pop-label">수치</div>
        <button type="button" class="nts-pop-search" data-search="${escapeAttr(q)}">Google에서 "${escapeHtml(q)}" 검색</button>
      </div>`;
    }
    case "context":
      return "";
  }
}

export function hidePopover(): void {
  const pop = document.getElementById(POPOVER_ID);
  if (pop) pop.style.display = "none";
  currentTarget = null;
}

function position(pop: HTMLElement, target: HTMLElement): void {
  const rect = target.getBoundingClientRect();
  pop.style.visibility = "hidden";
  pop.style.display = "block";
  pop.style.left = "0px";
  pop.style.top = "0px";

  const popRect = pop.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 6;

  if (left + popRect.width + 8 > window.scrollX + vw) {
    left = window.scrollX + vw - popRect.width - 8;
  }
  if (left < window.scrollX + 8) left = window.scrollX + 8;

  if (rect.bottom + popRect.height + 12 > vh) {
    top = rect.top + window.scrollY - popRect.height - 6;
  }
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  pop.style.visibility = "visible";
}

function ensurePopover(): HTMLElement {
  const existing = document.getElementById(POPOVER_ID);
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = POPOVER_ID;
  document.body.appendChild(el);
  return el;
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${POPOVER_ID} {
      position: absolute;
      z-index: 2147483646;
      display: none;
      max-width: 280px;
      padding: 10px 12px;
      background: rgba(28, 28, 32, 0.97);
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.28);
      font: 14px/1.45 system-ui, -apple-system, "Pretendard", sans-serif;
      pointer-events: auto;
    }
    #${POPOVER_ID} .nts-pop-label {
      font-size: 11px;
      letter-spacing: 0.04em;
      opacity: 0.7;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    #${POPOVER_ID} .nts-pop-body { word-break: keep-all; }
    #${POPOVER_ID} .nts-pop-sep {
      height: 1px;
      background: rgba(255,255,255,0.12);
      margin: 8px -12px;
    }
    #${POPOVER_ID} .nts-pop-sensational .nts-pop-label { color: #ff8a8a; }
    #${POPOVER_ID} .nts-pop-quantitative .nts-pop-label { color: #6fdb96; }
    #${POPOVER_ID} .nts-pop-term .nts-pop-label { color: #8aafff; }
    #${POPOVER_ID} .nts-pop-search {
      display: block;
      width: 100%;
      margin-top: 4px;
      padding: 8px 10px;
      background: rgba(80, 200, 120, 0.22);
      color: #fff;
      border: 1px solid rgba(80, 200, 120, 0.5);
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }
    #${POPOVER_ID} .nts-pop-rewrite {
      display: block;
      width: 100%;
      margin-top: 8px;
      padding: 8px 10px;
      background: rgba(255, 138, 138, 0.18);
      color: #fff;
      border: 1px solid rgba(255, 138, 138, 0.45);
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
      text-align: center;
    }
    #${POPOVER_ID} .nts-pop-rewrite:disabled { cursor: progress; opacity: 0.7; }
    #${POPOVER_ID} .nts-pop-rewrite-result {
      margin-top: 8px;
      padding: 8px 10px;
      background: rgba(120, 180, 255, 0.12);
      border-left: 3px solid rgba(120, 180, 255, 0.7);
      border-radius: 4px;
    }
    #${POPOVER_ID} .nts-pop-rewrite-label {
      font-size: 10px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #8ec5ff;
      font-weight: 700;
      margin-bottom: 4px;
    }
    #${POPOVER_ID} .nts-pop-rewrite-body {
      font-size: 13px;
      color: #f1f4ff;
      word-break: keep-all;
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]!);
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
