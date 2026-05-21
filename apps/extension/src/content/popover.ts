/**
 * 하이라이트 클릭 시 뜨는 작은 popover.
 *
 * - title 속성(OS 툴팁) 보다 즉시 보이고 디자인 통제 가능
 * - 한 번에 하나만 떠있음 (다른 곳 클릭하면 닫힘)
 * - 종류별로 본문 다르게:
 *     term: 용어 설명
 *     sensational: 자극 이유 + ⚠ 라벨
 *     quantitative: 수치 + "Google 검색" 버튼
 *     context: 별도 popover 없음 (시각 표시만)
 */
import type { Span } from "@newtrospect/core/server";

const POPOVER_ID = "nts-popover";
const STYLE_ID = "nts-popover-styles";

let currentTarget: HTMLElement | null = null;

export function bindPopovers(root: Element): void {
  ensureStyles();
  // 한 번만 바인딩 — content script 가 root 새로 잡을 때마다 재호출됨
  root.removeEventListener("click", onRootClick as EventListener);
  root.addEventListener("click", onRootClick as EventListener);
  document.removeEventListener("click", onDocClick);
  document.addEventListener("click", onDocClick);
}

function onRootClick(ev: MouseEvent): void {
  const target = (ev.target as HTMLElement)?.closest?.("nts-mark") as HTMLElement | null;
  if (!target) return;
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

  // context 만 들어있는 마크는 popover 없음 (시각 표시만이 디자인 원칙)
  const interactive = spans.filter((s) => s.kind !== "context");
  if (interactive.length === 0) {
    hidePopover();
    return;
  }

  const pop = ensurePopover();
  pop.innerHTML = interactive.map(renderSection).join('<div class="nts-pop-sep"></div>');
  pop.style.display = "block";
  position(pop, target);
  currentTarget = target;

  // 검색 버튼 핸들러 연결
  pop.querySelectorAll<HTMLElement>("[data-search]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const q = btn.dataset.search!;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank", "noopener");
    });
  });
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
  // 기본 — 마크 아래쪽에 8px 띄움
  pop.style.visibility = "hidden";
  pop.style.display = "block";
  pop.style.left = "0px";
  pop.style.top = "0px";

  const popRect = pop.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.left + window.scrollX;
  let top = rect.bottom + window.scrollY + 6;

  // 우측 넘침 보정
  if (left + popRect.width + 8 > window.scrollX + vw) {
    left = window.scrollX + vw - popRect.width - 8;
  }
  if (left < window.scrollX + 8) left = window.scrollX + 8;

  // 아래쪽 넘침 — 위로 띄움
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
      max-width: 320px;
      padding: 10px 12px;
      background: rgba(28, 28, 32, 0.97);
      color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.28);
      font: 13px/1.45 system-ui, -apple-system, "Pretendard", sans-serif;
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
      padding: 6px 10px;
      background: rgba(80, 200, 120, 0.22);
      color: #fff;
      border: 1px solid rgba(80, 200, 120, 0.5);
      border-radius: 6px;
      font: inherit;
      cursor: pointer;
      text-align: left;
    }
    #${POPOVER_ID} .nts-pop-search:hover {
      background: rgba(80, 200, 120, 0.32);
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
