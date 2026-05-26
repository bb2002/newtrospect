/**
 * specs/04 — 글 성격 7신호. 모바일은 fixed 우측 패널이 안 맞아서
 * *본문 하단(oneline 뒤)에 인라인 섹션*으로 표시.
 *
 * 디자인: 수평 게이지 막대. 단계 1~3 은 막대 길이(33%/66%/100%)로 표현.
 * 색은 카테고리 *성격* 을 인코딩 — 자극표현=빨강, 근거제시=초록, 사실주장=파랑 등.
 */
import {
  CHARACTER_SIGNAL_LABELS,
  CHARACTER_SIGNAL_ORDER,
  type CharacterResponse,
  type CharacterSignalKey,
} from "@newtrospect/core/server";

const PANEL_ID = "nts-character";
const STYLE_ID = "nts-character-styles";

/** 카테고리별 게이지 색 (성격 인지). */
const SIGNAL_COLOR: Record<CharacterSignalKey, { track: string; fill: string }> = {
  fact_claim:     { track: "rgba(90, 150, 255, 0.18)", fill: "#5a96ff" },
  opinion:        { track: "rgba(180, 130, 230, 0.18)", fill: "#b482e6" },
  value_judgment: { track: "rgba(230, 140, 200, 0.18)", fill: "#e68cc8" },
  sensational:    { track: "rgba(255, 110, 110, 0.18)", fill: "#ff6e6e" },
  evidence:       { track: "rgba(110, 210, 140, 0.18)", fill: "#6ed28c" },
  causation:      { track: "rgba(90, 200, 210, 0.18)", fill: "#5ac8d2" },
  prediction:     { track: "rgba(245, 200, 90, 0.18)", fill: "#f5c85a" },
};

/**
 * root 의 *뒤*(oneline 다음)에 인라인 패널로 삽입.
 * oneline 이 이미 root.afterend 로 들어가 있으면, 그 뒤에 추가.
 */
export function renderCharacter(root: Element, c: CharacterResponse): void {
  ensureStyles();
  removeCharacter();

  const panel = document.createElement("section");
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <header class="nts-char-head">
      <span class="nts-char-eyebrow">글 성격</span>
    </header>
    <ul class="nts-char-list">
      ${CHARACTER_SIGNAL_ORDER.map((k) => renderRow(k, c.signals[k])).join("")}
    </ul>
  `;

  // oneline 이 있으면 그 뒤, 없으면 root 뒤에.
  const oneline = document.getElementById("nts-oneline");
  if (oneline) {
    oneline.insertAdjacentElement("afterend", panel);
  } else {
    root.insertAdjacentElement("afterend", panel);
  }
}

export function removeCharacter(): void {
  document.getElementById(PANEL_ID)?.remove();
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

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    #${PANEL_ID} {
      box-sizing: border-box;
      margin: 16px 0 24px;
      padding: 14px 16px 14px;
      background: rgba(28, 30, 38, 0.96);
      color: #f1f3f8;
      border-radius: 12px;
      font: 13px/1.4 system-ui, -apple-system, "Pretendard", "Apple SD Gothic Neo", sans-serif;
    }
    #${PANEL_ID} .nts-char-head {
      margin-bottom: 10px;
    }
    #${PANEL_ID} .nts-char-eyebrow {
      font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
      color: #d0d6e8; font-weight: 700;
    }
    #${PANEL_ID} .nts-char-list {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 9px;
    }
    #${PANEL_ID} .nts-char-row {
      display: grid;
      grid-template-columns: 72px 1fr;
      align-items: center;
      gap: 12px;
    }
    #${PANEL_ID} .nts-char-label {
      font-size: 13px; color: #e6e9f2;
      white-space: nowrap;
    }
    #${PANEL_ID} .nts-char-gauge {
      display: block;
      height: 9px;
      border-radius: 5px;
      overflow: hidden;
    }
    #${PANEL_ID} .nts-char-gauge-fill {
      display: block;
      height: 100%;
      border-radius: 5px;
      transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `;
  document.head.appendChild(style);
}
