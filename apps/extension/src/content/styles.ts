/**
 * 콘텐츠 스크립트에서 페이지에 주입할 스타일.
 *
 * context(핵심 문장)는 *bold + 밑줄* — 책에서 가장 중요한 부분에 줄 긋는 metaphor.
 * 노란 배경 사용 안 함 (2026-05-26 디자인 변경).
 * sensational/quantitative/term 은 색별 배경 + 하단 밑줄 + cursor: pointer (popover).
 */

export const HIGHLIGHT_STYLES = `
nts-mark {
  display: inline;
  border-radius: 2px;
  padding: 0 2px;
  /* 페이지 CSS 가 부모에 pointer-events:none 걸어도 우리 mark 는 클릭 가능. */
  pointer-events: auto !important;
  /* 페이지의 다른 element 가 위에 덮어 클릭 가로채지 못하게. */
  position: relative;
  z-index: 1;
  cursor: pointer;
  /* 모바일에서 tap highlight 깔끔하게. */
  -webkit-tap-highlight-color: rgba(0,0,0,0.05);
  touch-action: manipulation;
}
/* nested 자식 mark 는 부모보다 더 위로 — hit-test 시 자식 우선. */
nts-mark nts-mark { z-index: 2; }
nts-mark.nts-context {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  text-decoration-color: #000;
  text-decoration-skip-ink: none;
}
nts-mark.nts-sensational {
  background: rgba(255, 90, 90, 0.32);
  box-shadow: inset 0 -1px 0 rgba(220, 0, 0, 0.55);
}
nts-mark.nts-quantitative {
  background: rgba(80, 200, 120, 0.32);
  box-shadow: inset 0 -1px 0 rgba(0, 140, 60, 0.55);
}
nts-mark.nts-term {
  background: rgba(90, 150, 255, 0.32);
  box-shadow: inset 0 -1px 0 rgba(20, 80, 200, 0.55);
}
/* context 안에 들어가는 다른 색은 자체 배경 + bold/밑줄 상속. */
nts-mark.nts-context nts-mark { font-weight: inherit; }
`;

export function injectStyles(): void {
  if (document.getElementById("nts-styles")) return;
  const style = document.createElement("style");
  style.id = "nts-styles";
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
}
