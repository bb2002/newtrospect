/**
 * specs/04 — 우측 fixed 패널에 글 성격 7신호를 *수평 게이지 막대* 로 표시.
 *
 * 디자인 원칙 (2026-05-26 개편):
 * - 단계 1~3 은 *막대 길이*(33% / 66% / 100%) 로 표현. 숫자·"적음/일부/두드러짐" 라벨 제거.
 * - 색은 카테고리 *성격* 을 인코딩 — 자극표현=빨강, 근거제시=초록, 사실주장=파랑 등.
 *   각 카테고리가 *얼마나 강한지* 가 막대 길이로, *어떤 종류인지* 가 색으로 한 번에 보임.
 * - 좁은 화면(1100px 이하)에서는 본문을 가리지 않게 자동 숨김.
 * - 사용자가 닫으면 그 페이지에 한해 다시 안 띄움.
 */
import {
  CHARACTER_SIGNAL_LABELS,
  CHARACTER_SIGNAL_ORDER,
  type CharacterResponse,
  type CharacterSignalKey,
} from "@newtrospect/core/server";

const PANEL_ID = "nts-character";
const STYLE_ID = "nts-character-styles";

let dismissed = false;

/**
 * 카테고리별 색상 — 카테고리의 성격을 즉각 연상시키는 톤.
 * track: 막대 배경(빈 부분), fill: 채워진 부분.
 */
const SIGNAL_COLOR: Record<CharacterSignalKey, { track: string; fill: string }> = {
  fact_claim:     { track: "rgba(90, 150, 255, 0.18)", fill: "#5a96ff" }, // 사실주장 — 파랑(객관)
  opinion:        { track: "rgba(180, 130, 230, 0.18)", fill: "#b482e6" }, // 의견/해석 — 보라(해석)
  value_judgment: { track: "rgba(230, 140, 200, 0.18)", fill: "#e68cc8" }, // 가치판단 — 분홍 보라(평가)
  sensational:    { track: "rgba(255, 110, 110, 0.18)", fill: "#ff6e6e" }, // 자극표현 — 빨강(경고)
  evidence:       { track: "rgba(110, 210, 140, 0.18)", fill: "#6ed28c" }, // 근거제시 — 초록(긍정)
  causation:      { track: "rgba(90, 200, 210, 0.18)", fill: "#5ac8d2" }, // 인과주장 — 청록(분석)
  prediction:     { track: "rgba(245, 200, 90, 0.18)", fill: "#f5c85a" }, // 예측 — 황색(전망)
};

export function renderCharacter(c: CharacterResponse): void {
  if (dismissed) return;
  ensureStyles();
  const el = ensurePanel();
  el.innerHTML = `
    <header class="nts-char-head">
      <span class="nts-char-eyebrow">글 성격</span>
      <button class="nts-char-close" type="button" aria-label="닫기">×</button>
    </header>
    <ul class="nts-char-list">
      ${CHARACTER_SIGNAL_ORDER.map((k) => renderRow(k, c.signals[k])).join("")}
    </ul>
  `;
  el.style.display = "block";
  el.querySelector(".nts-char-close")?.addEventListener("click", () => {
    dismissed = true;
    hideCharacter();
  });
}

export function hideCharacter(): void {
  const el = document.getElementById(PANEL_ID);
  if (el) el.style.display = "none";
}

/** SPA 페이지 전환 시 호출 — 새 페이지에서 다시 띄울 수 있게 dismissed 초기화. */
export function resetCharacterDismiss(): void {
  dismissed = false;
  hideCharacter();
}

function renderRow(k: CharacterSignalKey, lv: 1 | 2 | 3): string {
  const pct = lv === 1 ? 33 : lv === 2 ? 66 : 100;
  const c = SIGNAL_COLOR[k];
  return `
    <li class="nts-char-row">
      <span class="nts-char-label">${CHARACTER_SIGNAL_LABELS[k]}</span>
      <span class="nts-char-gauge" style="background:${c.track}">
        <span class="nts-char-gauge-fill" style="width:${pct}%;background:${c.fill}"></span>
      </span>
    </li>
  `;
}

function ensurePanel(): HTMLElement {
  const existing = document.getElementById(PANEL_ID);
  if (existing) return existing;
  const el = document.createElement("aside");
  el.id = PANEL_ID;
  document.body.appendChild(el);
  return el;
}

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} {
      position: fixed;
      top: 80px;
      right: 16px;
      z-index: 2147483645;
      width: 240px;
      padding: 14px 16px 14px;
      background: rgba(28, 30, 38, 0.94);
      color: #f1f3f8;
      border-radius: 12px;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.24);
      font: 12px/1.4 system-ui, -apple-system, "Pretendard", "Apple SD Gothic Neo", sans-serif;
      display: none;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    @media (max-width: 1100px) {
      #${PANEL_ID} { display: none !important; }
    }
    #${PANEL_ID} .nts-char-head {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    #${PANEL_ID} .nts-char-eyebrow {
      font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
      color: #d0d6e8; font-weight: 700;
    }
    #${PANEL_ID} .nts-char-close {
      background: transparent; border: 0; color: #b8c1da;
      font-size: 16px; line-height: 1; cursor: pointer;
      padding: 2px 6px; border-radius: 4px;
    }
    #${PANEL_ID} .nts-char-close:hover { background: rgba(255,255,255,0.1); color:#fff; }
    #${PANEL_ID} .nts-char-list {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 8px;
    }
    #${PANEL_ID} .nts-char-row {
      display: grid;
      grid-template-columns: 64px 1fr;
      align-items: center;
      gap: 10px;
    }
    #${PANEL_ID} .nts-char-label {
      font-size: 12px; color: #e6e9f2;
      white-space: nowrap;
    }
    #${PANEL_ID} .nts-char-gauge {
      display: block;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    #${PANEL_ID} .nts-char-gauge-fill {
      display: block;
      height: 100%;
      border-radius: 4px;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `;
  document.head.appendChild(style);
}
