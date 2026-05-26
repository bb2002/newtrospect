/**
 * WebView 안에서 실행되는 진입점.
 *
 * RN 본체가 페이지 로드마다 이 번들 전체를 `injectedJavaScript` 로 주입한다.
 * `injectedJavaScriptBeforeContentLoaded` 가 `window.__NEWTROSPECT_CONFIG__` 를 미리 깐다.
 *
 * 흐름:
 *   1. config 확인 → 없으면 종료
 *   2. extractArticleText (DOM → 평문)
 *   3. /api/detect-article → 뉴스 아니면 종료
 *   4. enabled 한 분석 병렬 호출 → 도착하는 대로 하이라이트
 *   5. 각 단계마다 RN 에 phase 메시지 postMessage
 */
import {
  NewtrospectClient,
  extractArticleText,
  MIN_BODY_LENGTH,
  selectorsForHost,
} from "@newtrospect/core";
import type { AnalysisKind, Span } from "@newtrospect/core/server";
import { applyHighlights } from "./highlight";
import { bindPopovers, hidePopover } from "./popover";
import { injectStyles } from "./styles";
import { renderCards, renderOneline, removeCardsAndOneline } from "./cards";
import { renderCharacter, removeCharacter } from "./character";

interface InjectionConfig {
  apiBaseUrl: string;
  enabled: Record<AnalysisKind, boolean>;
}

interface InjectionGlobal {
  config: InjectionConfig;
  run: (introspect?: boolean) => Promise<void>;
  _inflight?: AbortController;
  _lastUrl?: string;
  _navWatched?: boolean;
}

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (s: string) => void };
    __NEWTROSPECT_CONFIG__?: InjectionConfig;
    __newtrospect?: InjectionGlobal;
  }
}

const KINDS: AnalysisKind[] = ["term", "sensational", "quantitative", "context"];

function post(msg: unknown): void {
  try {
    window.ReactNativeWebView?.postMessage(JSON.stringify(msg));
  } catch {
    /* postMessage 실패 — 조용히 무시 */
  }
}

function relocateSpansToRoot(spans: Span[], cleanedText: string, rootElement: Element): Span[] {
  const rootText = rootElement.textContent ?? "";
  const cleanedCps = Array.from(cleanedText);

  const out: Span[] = [];
  for (const s of spans) {
    const spanText = cleanedCps.slice(s.start, s.end).join("");
    if (!spanText) continue;

    let utf16Start = rootText.indexOf(spanText);
    let matchedLen = spanText.length;

    if (utf16Start < 0) {
      const escaped = spanText
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+");
      const re = new RegExp(escaped);
      const m = rootText.match(re);
      if (!m || m.index === undefined) continue;
      utf16Start = m.index;
      matchedLen = m[0].length;
    }

    const newStart = Array.from(rootText.slice(0, utf16Start)).length;
    const newEnd =
      newStart + Array.from(rootText.slice(utf16Start, utf16Start + matchedLen)).length;
    out.push({ ...s, start: newStart, end: newEnd });
  }
  return out;
}

function currentArticleRoot(): Element | null {
  const host = location.hostname;
  for (const sel of selectorsForHost(host)) {
    const el = document.querySelector(sel);
    if (el && (el.textContent ?? "").length >= MIN_BODY_LENGTH) return el;
  }
  return null;
}

async function run(introspect = false): Promise<void> {
  const g = window.__newtrospect;
  if (!g) return;

  g._inflight?.abort();
  const ac = new AbortController();
  g._inflight = ac;

  post({ type: "phase", phase: "extracting", url: location.href, introspect });

  let extracted;
  try {
    extracted = extractArticleText(document, location.href);
  } catch (e) {
    post({ type: "phase", phase: "error", message: `extract failed: ${String(e)}` });
    return;
  }

  if (extracted.text.length < MIN_BODY_LENGTH) {
    post({ type: "phase", phase: "skip", reason: "too-short", textLen: extracted.text.length });
    return;
  }

  injectStyles();
  const client = new NewtrospectClient({
    baseUrl: g.config.apiBaseUrl,
    signal: ac.signal,
  });

  post({ type: "phase", phase: "detecting" });
  const detect = await client.detectArticle(extracted.text, location.href).catch(() => null);
  if (ac.signal.aborted) return;
  if (!detect?.isArticle) {
    post({ type: "phase", phase: "skip", reason: "not-article" });
    return;
  }

  const root = currentArticleRoot();
  if (!root) {
    post({ type: "phase", phase: "error", message: "본문 요소를 찾을 수 없음" });
    return;
  }
  bindPopovers(root, {
    // specs/03 — '온화한 표현으로 보기' 버튼이 호출.
    rewriteSensational: async (text, reason) => {
      const r = await client.rewriteSensational(text, reason);
      return r.rewritten;
    },
  });

  const enabled = KINDS.filter((k) => g.config.enabled[k]);
  if (enabled.length === 0) {
    post({ type: "phase", phase: "skip", reason: "all-disabled" });
    return;
  }

  // 7개 AI 병렬 호출:
  //   1~4: 색깔 마킹 (term / sensational / quantitative / context)
  //   5:   briefing (3장 카드, Pro 모델)
  //   6:   oneline  (한 줄 요약, flash 모델)
  //   7:   character (글 성격 7신호, flash 모델)
  // rewrite 는 사용자 탭 트리거라 이 묶음에 포함 안 함.
  const cleanedText = detect.cleanedText;
  const total = enabled.length + 3;
  let done = 0;
  let errors = 0;
  const tick = (failed: boolean): void => {
    if (failed) errors++;
    done++;
    if (!ac.signal.aborted) {
      post({ type: "phase", phase: "analyzing", done, total, errors });
    }
  };
  post({ type: "phase", phase: "analyzing", done, total, errors });

  // character.sensational 과 sensational spans 간 일관성 보정.
  let sensationalSpanCount = 0;
  let sensationalDone = false;
  let pendingCharacter: import("@newtrospect/core/server").CharacterResponse | null = null;
  const tryRenderCharacter = (): void => {
    if (!pendingCharacter || !sensationalDone) return;
    if (sensationalSpanCount === 0 && pendingCharacter.signals.sensational > 1) {
      pendingCharacter = {
        ...pendingCharacter,
        signals: { ...pendingCharacter.signals, sensational: 1 },
      };
    }
    renderCharacter(root, pendingCharacter);
    pendingCharacter = null;
  };

  const spanTasks = enabled.map(async (kind) => {
    try {
      const res = await client.analyze(kind, cleanedText);
      if (ac.signal.aborted) return;
      const relocated = relocateSpansToRoot(res.spans as Span[], cleanedText, root);
      applyHighlights(root, relocated);
      if (kind === "sensational") {
        sensationalSpanCount = (res.spans as Span[]).length;
        sensationalDone = true;
        tryRenderCharacter();
      }
      tick(false);
    } catch {
      if (kind === "sensational") {
        sensationalDone = true;
        tryRenderCharacter();
      }
      tick(true);
    }
  });

  const briefingTask = client
    .briefing(cleanedText)
    .then((b) => {
      if (ac.signal.aborted) return;
      renderCards(root, b);
      tick(false);
    })
    .catch(() => tick(true));

  const onelineTask = client
    .oneline(cleanedText)
    .then((o) => {
      if (ac.signal.aborted) return;
      renderOneline(root, o);
      tick(false);
    })
    .catch(() => tick(true));

  const characterTask = client
    .character(cleanedText)
    .then((c) => {
      if (ac.signal.aborted) return;
      pendingCharacter = c;
      tryRenderCharacter();
      tick(false);
    })
    .catch(() => tick(true));

  await Promise.allSettled([...spanTasks, briefingTask, onelineTask, characterTask]);

  if (pendingCharacter) {
    sensationalDone = true;
    tryRenderCharacter();
  }

  if (ac.signal.aborted) return;
  post({
    type: "phase",
    phase: errors === total ? "error" : "ok",
    done,
    total,
    errors,
  });
}

function watchNavigation(g: InjectionGlobal): void {
  if (g._navWatched) return;
  g._navWatched = true;

  const origPush = history.pushState;
  history.pushState = function (...args) {
    origPush.apply(this, args);
    onUrlChange();
  };
  const origReplace = history.replaceState;
  history.replaceState = function (...args) {
    origReplace.apply(this, args);
    onUrlChange();
  };
  window.addEventListener("popstate", onUrlChange);
}

let urlDebounce: ReturnType<typeof setTimeout> | null = null;
function onUrlChange(): void {
  const g = window.__newtrospect;
  if (!g) return;
  if (location.href === g._lastUrl) return;
  g._lastUrl = location.href;
  g._inflight?.abort();
  hidePopover();
  removeCardsAndOneline();
  removeCharacter();
  if (urlDebounce) clearTimeout(urlDebounce);
  urlDebounce = setTimeout(() => {
    run().catch(() => {});
  }, 300);
}

function init(): void {
  const cfg = window.__NEWTROSPECT_CONFIG__;
  if (!cfg) {
    post({ type: "phase", phase: "error", message: "config missing" });
    return;
  }

  if (window.__newtrospect) {
    window.__newtrospect.config = cfg;
    window.__newtrospect._lastUrl = location.href;
    run().catch(() => {});
    return;
  }

  const g: InjectionGlobal = {
    config: cfg,
    run,
    _lastUrl: location.href,
  };
  window.__newtrospect = g;

  watchNavigation(g);

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => run().catch(() => {}), 0);
  } else {
    window.addEventListener("DOMContentLoaded", () => run().catch(() => {}), { once: true });
  }
}

init();
