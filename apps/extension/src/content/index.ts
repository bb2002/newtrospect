import { NewtrospectClient, extractArticleText, MIN_BODY_LENGTH, selectorsForHost } from "@newtrospect/core";
import type { AnalysisKind, Span } from "@newtrospect/core/server";
import { loadSettings } from "../settings.ts";
import { applyHighlights } from "./highlight.ts";
import { injectStyles } from "./styles.ts";
import { updateBadge, hideBadge } from "./badge.ts";
import { bindPopovers, hidePopover } from "./popover.ts";
import { backgroundFetch } from "./bg-fetch.ts";

/**
 * 콘텐츠 스크립트 진입.
 *
 * 흐름:
 *   1. 설정 로드 → autoDetect 면 즉시 시도, 아니면 toolbar 메시지 기다림
 *   2. 본문 추출 (selectorsForHost → schema.org → <article> 폴백)
 *   3. /api/detect-article → 뉴스 아니면 종료
 *   4. enabled 한 분석들만 병렬 호출 → 도착하는 대로 하이라이트 적용
 *   5. badge 로 진행 상태 사용자에게 노출 (조용한 실패 방지)
 *   6. 페이지 전환(SPA pushState) 시 in-flight 요청 abort + 짧은 debounce 후 재실행
 */

// 디버깅: content script 가 실제로 페이지에 주입됐는지 확인용. 안 보이면 익스텐션
// 자체 unload+reload 필요. 정상 동작 확인 후 제거 가능.
console.log("[newtrospect] content script loaded", location.href);

let inflight: AbortController | null = null;
let lastUrl = location.href;
let runDebounce: ReturnType<typeof setTimeout> | null = null;

async function run(introspectMode = false): Promise<void> {
  console.log("[newtrospect] run() called", { introspectMode, url: location.href });
  inflight?.abort();
  inflight = new AbortController();
  const ac = inflight;

  const settings = await loadSettings();
  console.log("[newtrospect] settings", settings);
  if (!introspectMode && !settings.autoDetect) {
    console.log("[newtrospect] autoDetect off — skipping (use toolbar)");
    return;
  }

  const { text, host, selectorUsed, source } = extractArticleText(document, location.href);
  console.log("[newtrospect] extracted", { host, selectorUsed, source, textLen: text.length });
  if (text.length < MIN_BODY_LENGTH) {
    console.log("[newtrospect] text too short, skipping");
    if (introspectMode) updateBadge({ phase: "skip", done: 0, total: 0 });
    return;
  }

  injectStyles();
  // PNA(Private Network Access) 우회: content script 가 직접 fetch 하면
  // https 페이지 → 127.0.0.1 요청이 Chrome 에 의해 차단됨.
  // background service worker 가 대신 fetch 하도록 어댑터 주입.
  const client = new NewtrospectClient({ baseUrl: settings.apiBaseUrl, signal: ac.signal, fetch: backgroundFetch });

  const enabledKinds = (Object.keys(settings.enabled) as AnalysisKind[]).filter((k) => settings.enabled[k]);
  if (enabledKinds.length === 0) {
    if (introspectMode) updateBadge({ phase: "skip", done: 0, total: 0, message: "표시할 분석이 없음" });
    return;
  }

  // detect 가 끝나기 전엔 뱃지를 띄우지 않는다 — 뉴스 아닌 페이지에선
  // 사용자가 익스텐션의 존재를 인지할 필요 없음. 수동 트리거(toolbar) 일 때만
  // "판정 중..." 을 띄워 사용자가 동작 중임을 알 수 있게 한다.
  if (introspectMode) updateBadge({ phase: "running", done: 0, total: enabledKinds.length, message: "기사 판정 중..." });

  const detect = await client.detectArticle(text, location.href).catch(() => null);
  if (ac.signal.aborted) return;
  if (!detect?.isArticle) {
    // 자동 모드: 조용히 종료. 수동 모드: "기사 아님" 표시 후 3초 페이드.
    if (introspectMode) updateBadge({ phase: "skip", done: 0, total: enabledKinds.length });
    return;
  }

  const root = currentArticleRoot();
  if (!root) {
    if (introspectMode) updateBadge({ phase: "error", done: 0, total: enabledKinds.length, message: "본문 요소 찾을 수 없음" });
    return;
  }
  bindPopovers(root);
  // 이 시점부터는 둘 다(자동/수동) 진행 상태를 보여준다 — 분석은 몇 초 걸림.
  updateBadge({ phase: "running", done: 0, total: enabledKinds.length });

  let done = 0;
  let errors = 0;
  await Promise.allSettled(
    enabledKinds.map(async (kind) => {
      try {
        const res = await client.analyze(kind, detect.cleanedText);
        if (ac.signal.aborted) return;
        // 워커가 반환한 spans 는 detect.cleanedText (=extract 된 본문) 좌표계.
        // highlight 는 root.textContent 누적 offset 기준이라 좌표 변환 필요.
        // Readability fallback 시 cleanedText 가 root 의 일부분이므로 더 결정적.
        const relocated = relocateSpansToRoot(res.spans as Span[], detect.cleanedText, root);
        applyHighlights(root, relocated);
      } catch {
        errors++;
      } finally {
        done++;
        if (!ac.signal.aborted) {
          updateBadge({ phase: "running", done, total: enabledKinds.length });
        }
      }
    }),
  );

  if (ac.signal.aborted) return;
  if (errors === enabledKinds.length) {
    updateBadge({ phase: "error", done, total: enabledKinds.length, message: "서버 응답 실패 — 옵션 확인" });
  } else if (errors > 0) {
    updateBadge({ phase: "ok", done: done - errors, total: enabledKinds.length, message: `완료(부분 실패 ${errors})` });
  } else {
    updateBadge({ phase: "ok", done, total: enabledKinds.length });
  }
}

/**
 * 워커가 보낸 spans 의 좌표를 *root.textContent 기준 cp offset* 으로 재매핑.
 *
 * 왜 필요한가:
 *   - 워커가 받은 본문 (= detect.cleanedText, = extract().text) 은 normalize 된 평문.
 *   - Readability fallback 시 cleanedText 는 root.textContent 의 *일부분* (메뉴·푸터 제외).
 *   - highlight.ts 는 root.textContent 누적 offset 기준이라 그대로 쓰면 위치가 어긋남.
 *
 * 방법:
 *   - 각 span 의 텍스트(=cleanedText.slice(start,end)) 를 root.textContent 에서 다시 찾기.
 *   - 직접 indexOf 가 실패하면 공백을 \s+ 로 관대하게 매칭 (cleanedText 는 normalize 거쳐
 *     공백이 단일화됐지만 root 원본은 개행·연속 공백이 살아 있음).
 *   - 찾으면 cp offset 으로 변환해 반환. 못 찾으면 그 span 은 버림 (조용한 실패).
 */
function relocateSpansToRoot(spans: Span[], cleanedText: string, rootElement: Element): Span[] {
  const rootText = rootElement.textContent ?? "";
  const cleanedCps = Array.from(cleanedText);

  const out: Span[] = [];
  for (const s of spans) {
    const spanText = cleanedCps.slice(s.start, s.end).join("");
    if (!spanText) continue;

    // 1차: raw substring 매치 (대부분 케이스)
    let utf16Start = rootText.indexOf(spanText);
    let matchedLen = spanText.length;

    if (utf16Start < 0) {
      // 2차: 공백 관대 매치 — span 텍스트의 \s+ 를 정규식 \s+ 로 치환해 검색
      const escaped = spanText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
      const re = new RegExp(escaped);
      const m = rootText.match(re);
      if (!m || m.index === undefined) continue;
      utf16Start = m.index;
      matchedLen = m[0].length;
    }

    const newStart = Array.from(rootText.slice(0, utf16Start)).length;
    const newEnd = newStart + Array.from(rootText.slice(utf16Start, utf16Start + matchedLen)).length;
    out.push({ ...s, start: newStart, end: newEnd });
  }
  return out;
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

// SPA 페이지 전환 감지 — pushState/replaceState/popstate 패치.
function watchNavigation(): void {
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

function onUrlChange(): void {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  inflight?.abort();
  hideBadge();
  hidePopover();
  // SPA가 DOM 을 갱신할 시간을 짧게 준다 — 너무 빨리 추출하면 이전 본문이 잡힘.
  if (runDebounce) clearTimeout(runDebounce);
  runDebounce = setTimeout(() => {
    run().catch(() => {});
  }, 250);
}

// 툴바 아이콘 클릭으로 강제 트리거
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "introspect") run(true).catch(() => {});
});

watchNavigation();
run().catch(() => {});
