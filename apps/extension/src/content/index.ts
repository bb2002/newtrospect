import { NewtrospectClient, extractArticleText, MIN_BODY_LENGTH, selectorsForHost } from "@newtrospect/core";
import type { AnalysisKind, Span } from "@newtrospect/core/server";
import { loadSettings } from "../settings.ts";
import { applyHighlights } from "./highlight.ts";
import { injectStyles } from "./styles.ts";

/**
 * 콘텐츠 스크립트 진입.
 *
 * 흐름:
 *   1. 설정 로드 → autoDetect 면 즉시 시도, 아니면 toolbar 메시지 기다림
 *   2. 본문 추출 (selectorsForHost → <article> 폴백)
 *   3. /api/detect-article → 뉴스 아니면 종료
 *   4. enabled 한 분석들만 병렬 호출 → 도착하는 대로 하이라이트 적용
 *   5. 페이지 전환(SPA pushState) 시 in-flight 요청 abort
 */

let inflight: AbortController | null = null;
let lastUrl = location.href;

async function run(introspectMode = false): Promise<void> {
  inflight?.abort();
  inflight = new AbortController();
  const ac = inflight;

  const settings = await loadSettings();
  if (!introspectMode && !settings.autoDetect) return;

  const { text } = extractArticleText(document, location.href);
  if (text.length < MIN_BODY_LENGTH) return;

  injectStyles();
  const client = new NewtrospectClient({ baseUrl: settings.apiBaseUrl, signal: ac.signal });

  const detect = await client.detectArticle(text, location.href).catch(() => null);
  if (!detect?.isArticle) return;

  const root = currentArticleRoot();
  if (!root) return;

  const enabledKinds = (Object.keys(settings.enabled) as AnalysisKind[]).filter((k) => settings.enabled[k]);

  await Promise.allSettled(
    enabledKinds.map(async (kind) => {
      try {
        const res = await client.analyze(kind, detect.cleanedText);
        if (ac.signal.aborted) return;
        applyHighlights(root, res.spans as Span[]);
      } catch {
        // 한 분석 실패는 조용히 — 다른 색은 계속 진행
      }
    }),
  );
}

function currentArticleRoot(): Element | null {
  // extractArticleText 가 찾은 셀렉터와 동일 우선순위로 다시 탐색.
  // (TreeWalker 적용 대상이 필요해 두 번 찾아도 비용 무시 가능.)
  const host = location.hostname;
  for (const sel of selectorsForHost(host)) {
    const el = document.querySelector(sel);
    if (el && (el.textContent ?? "").length >= MIN_BODY_LENGTH) return el;
  }
  return null;
}

// SPA 페이지 전환 감지 — pushState/popstate 패치.
function watchNavigation(): void {
  const orig = history.pushState;
  history.pushState = function (...args) {
    orig.apply(this, args);
    onUrlChange();
  };
  window.addEventListener("popstate", onUrlChange);
}

function onUrlChange(): void {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  inflight?.abort();
  // 새 페이지에서 다시 시도 — autoDetect 가 켜져 있어야만
  run().catch(() => {});
}

// 툴바 아이콘 클릭으로 강제 트리거
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "introspect") run(true).catch(() => {});
});

watchNavigation();
run().catch(() => {});
