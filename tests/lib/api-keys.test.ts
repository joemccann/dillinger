import { describe, it, expect } from "vitest";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";

describe("generateApiKey", () => {
  it("returns plaintext starting with dk_", () => {
    const { plaintext } = generateApiKey();
    expect(plaintext).toMatch(/^dk_[a-f0-9]{64}$/);
  });

  it("returns a 64-char hex hash", () => {
    const { hash } = generateApiKey();
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns an 8-char prefix", () => {
    const { prefix } = generateApiKey();
    expect(prefix).toHaveLength(8);
    expect(prefix).toMatch(/^[a-f0-9]{8}$/);
  });

  it("generates unique keys each time", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.plaintext).not.toBe(b.plaintext);
    expect(a.hash).not.toBe(b.hash);
  });

  it("hash matches hashing the plaintext", () => {
    const { plaintext, hash } = generateApiKey();
    expect(hashApiKey(plaintext)).toBe(hash);
  });
});

describe("hashApiKey", () => {
  it("produces consistent output for same input", () => {
    const key = "dk_abc123";
    expect(hashApiKey(key)).toBe(hashApiKey(key));
  });

  it("produces different output for different input", () => {
    expect(hashApiKey("dk_abc")).not.toBe(hashApiKey("dk_xyz"));
  });

  it("returns 64-char hex string", () => {
    const result = hashApiKey("dk_test");
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });
});
