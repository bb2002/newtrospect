/**
 * Background service worker.
 * 현 단계는 툴바 아이콘 클릭 = introspect 트리거만 처리.
 * cross-origin fetch 는 content script 가 직접 한다 (host_permissions 로 허용).
 */

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  await chrome.tabs.sendMessage(tab.id, { type: "introspect" }).catch(() => {
    // content script 미주입 (chrome:// 등) — 조용히 무시
  });
});
