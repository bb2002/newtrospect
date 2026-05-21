/**
 * content script 에서 사용하는 fetch 어댑터.
 * chrome.runtime.sendMessage 로 background 에 위임 (PNA 우회).
 *
 * NewtrospectClient 의 `fetch: typeof fetch` 시그니처에 맞추기 위해
 * Response 객체를 mock 해서 반환한다. ok / status / json() 만 호출되므로
 * 그 3개만 충족시키면 충분.
 */

interface BgFetchReply {
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
}

export const backgroundFetch: typeof fetch = async (input, init) => {
  const url = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
  const method = init?.method ?? (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET");
  const headers = init?.headers as Record<string, string> | undefined;
  const body = init?.body;

  let bodyText: string | undefined;
  if (typeof body === "string") {
    bodyText = body;
  } else if (body == null) {
    bodyText = undefined;
  } else {
    bodyText = await new Response(body).text();
  }

  const reply = (await chrome.runtime.sendMessage({
    type: "nts-fetch",
    payload: { url, method, headers, body: bodyText },
  })) as BgFetchReply | undefined;

  if (!reply) {
    throw new Error("background_no_reply");
  }
  if (reply.error) {
    throw new Error(reply.error);
  }

  const responseBody = reply.data == null ? null : JSON.stringify(reply.data);
  return new Response(responseBody, {
    status: reply.status,
    headers: { "content-type": "application/json" },
  });
};
