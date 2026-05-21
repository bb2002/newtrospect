/**
 * 페이지 우상단에 떠있는 진행 상태 뱃지.
 *
 * 사용자가 "지금 newtrospect가 뭘 하고 있는지" 알 수 있어야 한다는 게 핵심.
 * 조용한 실패가 가장 큰 함정이다 — 분석이 안 됐을 때 사용자는 "내가 뭘 잘못한 거지"
 * 라고 생각한다. 그래서 시작/진행/완료/실패 모두 시각적으로 노출.
 *
 * 디자인 원칙:
 * - 본문 가리지 않게 작게. 닫기 버튼 있음.
 * - 완료 시 3초 뒤 자동 페이드.
 * - 본 페이지 CSS 와 격리되도록 클래스명에 nts- 접두 + !important 회피용 인라인 일부.
 */

export type BadgePhase = "running" | "ok" | "error" | "skip";

interface BadgeState {
  phase: BadgePhase;
  done: number;
  total: number;
  message?: string;
}

const BADGE_ID = "nts-badge";

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function updateBadge(state: BadgeState): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  const el = ensureBadge();
  const label = state.message ?? defaultLabel(state);
  el.dataset.phase = state.phase;
  el.querySelector(".nts-badge-label")!.textContent = label;
  el.style.display = "flex";

  if (state.phase === "ok" || state.phase === "skip") {
    hideTimer = setTimeout(() => hideBadge(), 3000);
  }
}

export function hideBadge(): void {
  const el = document.getElementById(BADGE_ID);
  if (el) el.style.display = "none";
}

function defaultLabel(s: BadgeState): string {
  switch (s.phase) {
    case "running": return `분석 중 ${s.done}/${s.total}`;
    case "ok": return `완료 (${s.done}/${s.total})`;
    case "error": return `오류 (${s.done}/${s.total})`;
    case "skip": return "기사 아님 — 분석 건너뜀";
  }
}

function ensureBadge(): HTMLElement {
  const existing = document.getElementById(BADGE_ID);
  if (existing) return existing;

  const style = document.createElement("style");
  style.id = "nts-badge-styles";
  style.textContent = `
    #${BADGE_ID} {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      font: 12px/1.3 system-ui, -apple-system, "Pretendard", sans-serif;
      color: #fff;
      background: rgba(20, 20, 24, 0.86);
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      cursor: default;
      user-select: none;
      pointer-events: auto;
    }
    #${BADGE_ID}[data-phase="ok"] { background: rgba(20, 100, 60, 0.92); }
    #${BADGE_ID}[data-phase="error"] { background: rgba(180, 40, 40, 0.92); }
    #${BADGE_ID}[data-phase="skip"] { background: rgba(80, 80, 90, 0.86); }
    #${BADGE_ID} .nts-badge-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #fff;
      opacity: 0.9;
    }
    #${BADGE_ID}[data-phase="running"] .nts-badge-dot {
      animation: nts-pulse 1.2s ease-in-out infinite;
    }
    #${BADGE_ID} .nts-badge-close {
      margin-left: 4px;
      width: 14px; height: 14px;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 50%;
      cursor: pointer;
      opacity: 0.6;
    }
    #${BADGE_ID} .nts-badge-close:hover { opacity: 1; background: rgba(255,255,255,0.18); }
    @keyframes nts-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const el = document.createElement("div");
  el.id = BADGE_ID;
  el.innerHTML = `
    <span class="nts-badge-dot"></span>
    <span class="nts-badge-label"></span>
    <span class="nts-badge-close" title="닫기">×</span>
  `;
  el.querySelector(".nts-badge-close")!.addEventListener("click", hideBadge);
  document.body.appendChild(el);
  return el;
}
