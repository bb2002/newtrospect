/**
 * 본문 SHA-256. 캐시 키로 쓰인다 (URL 아님).
 * 같은 기사가 다른 URL로 노출되어도 캐시 hit, 본문 수정 시 자동 미스.
 * Web Crypto API 가 있는 환경에서만 동작 (브라우저·Workers·RN 모두 OK).
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let out = "";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}
