import { describe, it, expect, beforeEach, vi } from "vitest";

describe("cache", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  async function loadCache() {
    const mod = await import("@/lib/cache");
    return mod;
  }

  describe("getCached", () => {
    it("returns null for missing keys", async () => {
      const { getCached } = await loadCache();
      expect(getCached("nonexistent")).toBeNull();
    });

    it("returns null for expired entries", async () => {
      vi.useFakeTimers();
      const { getCached, setCache } = await loadCache();

      setCache("temp", "value", 1000);
      vi.advanceTimersByTime(1001);

      expect(getCached("temp")).toBeNull();
    });

    it("retrieves a typed object via generic parameter", async () => {
      const { getCached, setCache } = await loadCache();

      interface User {
        name: string;
        age: number;
      }

      const user: User = { name: "Alice", age: 30 };
      setCache("user", user);

      const retrieved = getCached<User>("user");
      expect(retrieved).toEqual({ name: "Alice", age: 30 });
      expect(retrieved?.name).toBe("Alice");
    });
  });

  describe("setCache + getCached round-trip", () => {
    it("stores and retrieves a string value", async () => {
      const { getCached, setCache } = await loadCache();

      setCache("greeting", "hello");
      expect(getCached<string>("greeting")).toBe("hello");
    });

    it("stores and retrieves an object value", async () => {
      const { getCached, setCache } = await loadCache();

      const data = { items: [1, 2, 3], nested: { ok: true } };
      setCache("data", data);
      expect(getCached("data")).toEqual(data);
    });
  });

  describe("TTL behavior", () => {
    it("uses a default TTL of 5 minutes", async () => {
      vi.useFakeTimers();
      const { getCached, setCache } = await loadCache();

      setCache("defaultTTL", "alive");

      // Still valid just before 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000 - 1);
      expect(getCached("defaultTTL")).toBe("alive");

      // Expired right after 5 minutes
      vi.advanceTimersByTime(2);
      expect(getCached("defaultTTL")).toBeNull();
    });

    it("respects a custom TTL", async () => {
      vi.useFakeTimers();
      const { getCached, setCache } = await loadCache();

      setCache("short", "data", 2000);

      vi.advanceTimersByTime(1999);
      expect(getCached("short")).toBe("data");

      vi.advanceTimersByTime(2);
      expect(getCached("short")).toBeNull();
    });
  });

  describe("eviction", () => {
    it("evicts expired entries when at capacity", async () => {
      vi.useFakeTimers();
      const { getCached, setCache } = await loadCache();

      // Fill cache to capacity with short TTL
      for (let i = 0; i < 200; i++) {
        setCache(`expired-${i}`, i, 1000);
      }

      // Expire all entries
      vi.advanceTimersByTime(1001);

      // This insert triggers evictExpired, clearing all 200 expired entries
      setCache("survivor", "still here", 60_000);

      expect(getCached<string>("survivor")).toBe("still here");
      // Expired entries should be gone
      expect(getCached(`expired-0`)).toBeNull();
      expect(getCached(`expired-199`)).toBeNull();
    });

    it("evicts the oldest entry when at capacity with no expired entries", async () => {
      vi.useFakeTimers();
      const { getCached, setCache } = await loadCache();

      const longTTL = 10 * 60 * 1000;

      // Fill cache to capacity with long TTL
      for (let i = 0; i < 200; i++) {
        setCache(`item-${i}`, i, longTTL);
      }

      // Insert one more - should evict the oldest (item-0)
      setCache("new-item", "new", longTTL);

      expect(getCached("item-0")).toBeNull();
      expect(getCached<string>("new-item")).toBe("new");
      // Second entry should still exist
      expect(getCached<number>("item-1")).toBe(1);
    });
  });

  describe("tokenPrefix", () => {
    it("returns the first 8 characters of a token", async () => {
      const { tokenPrefix } = await loadCache();

      expect(tokenPrefix("abcdefghijklmnop")).toBe("abcdefgh");
      expect(tokenPrefix("ghp_abc123xyz456")).toBe("ghp_abc1");
    });

    it("handles strings shorter than 8 characters", async () => {
      const { tokenPrefix } = await loadCache();

      expect(tokenPrefix("short")).toBe("short");
      expect(tokenPrefix("")).toBe("");
      expect(tokenPrefix("12345678")).toBe("12345678");
    });
  });
});
