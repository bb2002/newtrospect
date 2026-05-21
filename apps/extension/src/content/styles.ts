/**
 * 콘텐츠 스크립트에서 페이지에 주입할 스타일.
 *
 * 노란 배경(context) 위에 inline 강조가 *덮이지 않고 공존* 하도록:
 * - context: 노란 배경만, 다른 색은 inline 자손 으로 들어옴
 * - sensational/quantitative/term: 색별 배경 + 하단 밑줄. cursor: pointer (popover)
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
/* context 안에 들어가는 다른 색은 자체 배경 위에 덧칠. 노란 배경은 부모(context) 가 깔아준다. */
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
