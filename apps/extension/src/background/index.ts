/**
 * Background service worker.
 *
 * 책임 1: 툴바 아이콘 클릭 = introspect 트리거.
 * 책임 2: content script 의 fetch 위임 처리.
 *   Chrome Private Network Access(PNA) 가 https 페이지에서 127.0.0.1 으로의
 *   요청을 차단한다. background 는 chrome-extension:// origin 이라 PNA 적용 안 됨 →
 *   여기서 대신 fetch 한 뒤 결과를 회신.
 *
 * 메시지 schema:
 *   { type: "introspect" }                              — content 가 받아 처리
 *   { type: "nts-fetch", payload: NtsFetchRequest }     — content → background
 *      payload = { url, method, headers?, body? }
 *      reply   = { ok, status, data?, error? }
 */

interface NtsFetchRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

interface NtsFetchReply {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;
  await chrome.tabs.sendMessage(tab.id, { type: "introspect" }).catch(() => {
    // content script 미주입 (chrome:// 등) — 조용히 무시
  });
});

chrome.runtime.onMessage.addListener((msg: unknown, _sender, sendResponse) => {
  if (!isFetchRequest(msg)) return false;
  handleFetch(msg.payload).then(sendResponse).catch((err) => {
    sendResponse({
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    } satisfies NtsFetchReply);
  });
  return true; // async response
});

function isFetchRequest(m: unknown): m is { type: "nts-fetch"; payload: NtsFetchRequest } {
  return (
    typeof m === "object" &&
    m !== null &&
    (m as { type?: unknown }).type === "nts-fetch" &&
    typeof (m as { payload?: unknown }).payload === "object"
  );
}

async function handleFetch(req: NtsFetchRequest): Promise<NtsFetchReply> {
  try {
    const res = await fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      // 응답이 JSON 아니면 문자열 그대로
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
