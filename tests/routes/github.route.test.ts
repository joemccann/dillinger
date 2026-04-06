// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: mockCookieGet,
  })),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function setTokenCookie(token: string | undefined) {
  mockCookieGet.mockImplementation((name: string) =>
    name === "github_token" && token ? { value: token } : undefined
  );
}

function mockGitHubResponse(url: string | RegExp, body: unknown, ok = true) {
  mockFetch.mockImplementation((requestUrl: string) => {
    if (typeof url === "string" ? requestUrl.includes(url) : url.test(requestUrl)) {
      return Promise.resolve({
        ok,
        status: ok ? 200 : 401,
        json: () => Promise.resolve(body),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  });
}

function mockMultipleGitHubResponses(
  responses: Array<{ url: string; body: unknown; ok?: boolean }>
) {
  mockFetch.mockImplementation((requestUrl: string) => {
    const matches = responses.filter((r) => requestUrl.includes(r.url));
    const match = matches.sort((a, b) => b.url.length - a.url.length)[0];
    if (match) {
      return Promise.resolve({
        ok: match.ok !== false,
        status: match.ok !== false ? 200 : 401,
        json: () => Promise.resolve(match.body),
      });
    }
    return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("GET /api/github/status", () => {
  async function importHandler() {
    const mod = await import("@/app/api/github/status/route");
    return mod.GET;
  }

  it("returns connected=true when token exists and GitHub API responds", async () => {
    setTokenCookie("mock-token");
    mockGitHubResponse("api.github.com/user", {
      login: "octocat",
      name: "Octo Cat",
      avatar_url: "https://github.com/octocat.png",
    });

    const GET = await importHandler();
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.connected).toBe(true);
    expect(json.user).toEqual({
      login: "octocat",
      name: "Octo Cat",
      avatar_url: "https://github.com/octocat.png",
    });
  });

  it("returns connected=false when no token cookie", async () => {
    setTokenCookie(undefined);

    const GET = await importHandler();
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.connected).toBe(false);
    expect(json.user).toBeUndefined();
  });

  it("returns connected=false when GitHub API rejects token", async () => {
    setTokenCookie("expired-token");
    mockGitHubResponse("api.github.com/user", { message: "Bad credentials" }, false);

    const GET = await importHandler();
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.connected).toBe(false);
  });
});

describe("GET /api/github/repos", () => {
  async function importHandler() {
    const mod = await import("@/app/api/github/repos/route");
    return mod.GET;
  }

  it("returns repos for authenticated user", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
      {
        url: "api.github.com/user/repos",
        body: [
          {
            name: "hello-world",
            full_name: "octocat/hello-world",
            private: false,
            default_branch: "main",
          },
        ],
      },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=octocat"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(json.items[0]).toEqual({
      name: "hello-world",
      full_name: "octocat/hello-world",
      private: false,
      default_branch: "main",
    });
  });

  it("returns 401 when no token", async () => {
    setTokenCookie(undefined);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=octocat"
    );
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("supports pagination params", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
      {
        url: "api.github.com/user/repos",
        body: [
          {
            name: "repo-page2",
            full_name: "octocat/repo-page2",
            private: true,
            default_branch: "develop",
          },
        ],
      },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=octocat&page=2&per_page=10"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);

    const fetchedUrl = mockFetch.mock.calls.find(
      (call: string[]) =>
        typeof call[0] === "string" && call[0].includes("user/repos")
    )?.[0];
    expect(fetchedUrl).toContain("page=2");
    expect(fetchedUrl).toContain("per_page=10");
  });
});

describe("GET /api/github/orgs", () => {
  async function importHandler() {
    const mod = await import("@/app/api/github/orgs/route");
    return mod.GET;
  }

  it("returns parallelized user + orgs data", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user/orgs",
        body: [{ login: "github-org", type: "Organization" }],
      },
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
    ]);

    const GET = await importHandler();
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json[0]).toEqual({ login: "octocat", type: "user" });
    expect(json[1]).toEqual({ login: "github-org", type: "Organization" });
    expect(json).toHaveLength(2);
  });

  it("returns 401 when no token", async () => {
    setTokenCookie(undefined);

    const GET = await importHandler();
    const response = await GET();

    expect(response.status).toBe(401);
  });
});

describe("GET /api/github/repos (additional coverage)", () => {
  async function importHandler() {
    const mod = await import("@/app/api/github/repos/route");
    return mod.GET;
  }

  it("returns 400 when owner param is missing", async () => {
    setTokenCookie("mock-token");

    const GET = await importHandler();
    const request = new NextRequest("http://localhost/api/github/repos");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Owner is required");
  });

  it("fetches org repos when owner differs from authenticated user", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
      {
        url: "api.github.com/orgs/my-org/repos",
        body: [
          {
            name: "org-repo",
            full_name: "my-org/org-repo",
            private: true,
            default_branch: "main",
          },
        ],
      },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=my-org"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(json.items[0].full_name).toBe("my-org/org-repo");

    const orgFetchUrl = mockFetch.mock.calls.find(
      (call: string[]) =>
        typeof call[0] === "string" && call[0].includes("orgs/my-org/repos")
    )?.[0];
    expect(orgFetchUrl).toBeDefined();
  });

  it("returns 500 when GitHub API errors", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
      {
        url: "api.github.com/user/repos",
        body: { message: "Internal Server Error" },
        ok: false,
      },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=octocat"
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to fetch repositories");
  });

  it("populates cache after successful fetch", async () => {
    setTokenCookie("mock-token");
    mockMultipleGitHubResponses([
      {
        url: "api.github.com/user",
        body: { login: "octocat" },
      },
      {
        url: "api.github.com/user/repos",
        body: [
          {
            name: "cached-repo",
            full_name: "octocat/cached-repo",
            private: false,
            default_branch: "main",
          },
        ],
      },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/repos?owner=octocat&page=5&per_page=5"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.items).toHaveLength(1);
    expect(json.items[0].name).toBe("cached-repo");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("api.github.com"),
      expect.any(Object)
    );
  });
});

describe("GET /api/github/branches", () => {
  async function importHandler() {
    const mod = await import("@/app/api/github/branches/route");
    return mod.GET;
  }

  it("returns branches for owner/repo", async () => {
    setTokenCookie("mock-token");
    mockGitHubResponse("api.github.com/repos/octocat/hello-world/branches", [
      { name: "main", commit: { sha: "abc123" } },
      { name: "develop", commit: { sha: "def456" } },
    ]);

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/branches?owner=octocat&repo=hello-world"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(2);
    expect(json[0]).toEqual({ name: "main", sha: "abc123" });
    expect(json[1]).toEqual({ name: "develop", sha: "def456" });
  });

  it("returns 400 when missing both owner and repo params", async () => {
    setTokenCookie("mock-token");

    const GET = await importHandler();
    const response = await GET(
      new NextRequest("http://localhost/api/github/branches")
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Owner and repo are required");
  });

  it("returns 400 when repo param is missing", async () => {
    setTokenCookie("mock-token");

    const GET = await importHandler();
    const response = await GET(
      new NextRequest("http://localhost/api/github/branches?owner=octocat")
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Owner and repo are required");
  });

  it("returns 400 when owner param is missing", async () => {
    setTokenCookie("mock-token");

    const GET = await importHandler();
    const response = await GET(
      new NextRequest("http://localhost/api/github/branches?repo=hello-world")
    );

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Owner and repo are required");
  });

  it("returns 401 when no token", async () => {
    setTokenCookie(undefined);

    const GET = await importHandler();
    const response = await GET(
      new NextRequest(
        "http://localhost/api/github/branches?owner=octocat&repo=hello-world"
      )
    );

    expect(response.status).toBe(401);
  });

  it("returns 500 when GitHub API errors", async () => {
    setTokenCookie("mock-token");
    mockGitHubResponse(
      "api.github.com/repos/octocat/hello-world/branches",
      { message: "Not Found" },
      false
    );

    const GET = await importHandler();
    const response = await GET(
      new NextRequest(
        "http://localhost/api/github/branches?owner=octocat&repo=hello-world"
      )
    );

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe("Failed to fetch branches");
  });

  it("populates cache after successful fetch", async () => {
    setTokenCookie("mock-token");
    mockGitHubResponse(
      "api.github.com/repos/octocat/cache-test/branches",
      [{ name: "main", commit: { sha: "aaa111" } }]
    );

    const GET = await importHandler();
    const request = new NextRequest(
      "http://localhost/api/github/branches?owner=octocat&repo=cache-test"
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveLength(1);
    expect(json[0]).toEqual({ name: "main", sha: "aaa111" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("repos/octocat/cache-test/branches"),
      expect.any(Object)
    );
  });
});
