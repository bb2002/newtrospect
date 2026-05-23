/**
 * WebView 안에 주입되는 하이라이트 스타일. extension content/styles.ts 와 *의도적으로 동일*.
 */

export const HIGHLIGHT_STYLES = `
nts-mark {
  display: inline;
  border-radius: 2px;
  padding: 0 1px;
}
nts-mark.nts-context {
  background: rgba(255, 220, 90, 0.42);
  border-radius: 1px;
}
nts-mark.nts-sensational {
  background: rgba(255, 90, 90, 0.32);
  box-shadow: inset 0 -1px 0 rgba(220, 0, 0, 0.55);
  cursor: pointer;
}
nts-mark.nts-quantitative {
  background: rgba(80, 200, 120, 0.32);
  box-shadow: inset 0 -1px 0 rgba(0, 140, 60, 0.55);
  cursor: pointer;
}
nts-mark.nts-term {
  background: rgba(90, 150, 255, 0.32);
  box-shadow: inset 0 -1px 0 rgba(20, 80, 200, 0.55);
  cursor: pointer;
}
nts-mark.nts-context nts-mark { background-color: inherit; }
nts-mark.nts-context nts-mark.nts-sensational { background: rgba(255, 90, 90, 0.36); }
nts-mark.nts-context nts-mark.nts-quantitative { background: rgba(80, 200, 120, 0.36); }
nts-mark.nts-context nts-mark.nts-term { background: rgba(90, 150, 255, 0.36); }
`;

export function injectStyles(): void {
  if (document.getElementById("nts-styles")) return;
  const style = document.createElement("style");
  style.id = "nts-styles";
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
}
