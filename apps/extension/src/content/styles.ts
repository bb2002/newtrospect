/**
 * 콘텐츠 스크립트에서 페이지에 주입할 스타일.
 * 별도 CSS 파일 + manifest.web_accessible_resources 로도 되지만,
 * 첫 cut 은 인라인 <style> 주입으로 단순화.
 */

export const HIGHLIGHT_STYLES = `
nts-mark {
  display: inline;
  border-radius: 2px;
  cursor: help;
  padding: 0 1px;
}
nts-mark.nts-sensational {
  background: rgba(255, 90, 90, 0.32);
  box-shadow: inset 0 -1px 0 rgba(220, 0, 0, 0.4);
}
nts-mark.nts-quantitative {
  background: rgba(80, 200, 120, 0.32);
  box-shadow: inset 0 -1px 0 rgba(0, 140, 60, 0.4);
}
nts-mark.nts-term {
  background: rgba(90, 150, 255, 0.32);
  box-shadow: inset 0 -1px 0 rgba(20, 80, 200, 0.45);
  cursor: pointer;
}
nts-mark.nts-context {
  background: rgba(255, 220, 90, 0.42);
}
`;

export function injectStyles(): void {
  if (document.getElementById("nts-styles")) return;
  const style = document.createElement("style");
  style.id = "nts-styles";
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
}
