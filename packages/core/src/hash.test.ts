import { describe, expect, it } from "vitest";
import { sha256Hex } from "./hash.ts";

describe("sha256Hex", () => {
  it("returns the known SHA-256 hex digest for empty string", async () => {
    const got = await sha256Hex("");
    expect(got).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });

  it("returns the known digest for ascii", async () => {
    const got = await sha256Hex("abc");
    expect(got).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("hashes Korean text consistently", async () => {
    const a = await sha256Hex("안녕하세요");
    const b = await sha256Hex("안녕하세요");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("produces different digests for different inputs", async () => {
    const a = await sha256Hex("뉴스1");
    const b = await sha256Hex("뉴스2");
    expect(a).not.toBe(b);
  });

  it("emits only lowercase hex chars", async () => {
    const got = await sha256Hex("test fixture for hex shape");
    expect(got).toMatch(/^[0-9a-f]{64}$/);
  });
});
