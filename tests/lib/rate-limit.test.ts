import { describe, it, expect, vi, beforeEach } from "vitest";

const mockIncr = vi.fn();
const mockExpire = vi.fn();

vi.mock("@vercel/kv", () => ({
  kv: {
    incr: (...args: unknown[]) => mockIncr(...args),
    expire: (...args: unknown[]) => mockExpire(...args),
  },
}));

import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows requests under the limit", async () => {
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue(true);

    const result = await rateLimit("key1", 100, 3600);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(99);
    expect(result.limit).toBe(100);
  });

  it("blocks requests over the limit", async () => {
    mockIncr.mockResolvedValue(101);

    const result = await rateLimit("key1", 100, 3600);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("sets expiry on first request in window", async () => {
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue(true);

    await rateLimit("key1", 100, 3600);
    expect(mockExpire).toHaveBeenCalled();
  });

  it("does not set expiry on subsequent requests", async () => {
    mockIncr.mockResolvedValue(5);

    await rateLimit("key1", 100, 3600);
    expect(mockExpire).not.toHaveBeenCalled();
  });

  it("fails gracefully when KV is unavailable", async () => {
    mockIncr.mockRejectedValue(new Error("connection refused"));

    const result = await rateLimit("key1", 100, 3600);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(100);
  });
});

describe("rateLimitHeaders", () => {
  it("returns correct header names and values", () => {
    const headers = rateLimitHeaders({
      success: true,
      limit: 100,
      remaining: 95,
      reset: 1700000000,
    });

    expect(headers["X-RateLimit-Limit"]).toBe("100");
    expect(headers["X-RateLimit-Remaining"]).toBe("95");
    expect(headers["X-RateLimit-Reset"]).toBe("1700000000");
  });
});
