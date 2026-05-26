/**
 * WebView 안에 주입되는 하이라이트 스타일. extension content/styles.ts 와 *의도적으로 동일*.
 *
 * context(핵심 문장)는 *bold + 검정 밑줄* — 책에 줄 긋는 metaphor. 노란 배경 사용 안 함.
 */

export const HIGHLIGHT_STYLES = `
nts-mark {
  display: inline;
  border-radius: 2px;
  padding: 0 1px;
  pointer-events: auto !important;
  position: relative;
  z-index: 1;
  cursor: pointer;
}
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
nts-mark.nts-context nts-mark { font-weight: inherit; }
`;

export function injectStyles(): void {
  if (document.getElementById("nts-styles")) return;
  const style = document.createElement("style");
  style.id = "nts-styles";
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
}
