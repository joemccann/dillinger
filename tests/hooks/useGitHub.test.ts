import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(ToastProvider, null, children);
}

function mockFetchResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  });
}

const mockUser = { login: "octocat", name: "Octocat", avatar_url: "https://example.com/avatar.png" };

const mockOrgs = [
  { login: "org-a", type: "Organization" },
  { login: "org-b", type: "Organization" },
];

const mockRepos = [
  { name: "repo-1", full_name: "octocat/repo-1", private: false, default_branch: "main" },
  { name: "repo-2", full_name: "octocat/repo-2", private: true, default_branch: "develop" },
];

const mockBranches = [
  { name: "main", sha: "abc123" },
  { name: "feature", sha: "def456" },
];

const mockFiles = [
  { path: "README.md", sha: "sha1", url: "https://api.github.com/repos/octocat/repo-1/contents/README.md" },
  { path: "docs/guide.md", sha: "sha2", url: "https://api.github.com/repos/octocat/repo-1/contents/docs/guide.md" },
];

describe("useGitHub", () => {
  let fetchMock: Mock;

  beforeEach(() => {
    vi.resetModules();
    fetchMock = vi.fn(() => mockFetchResponse({ connected: false, user: null }));
    vi.stubGlobal("fetch", fetchMock);
  });

  async function importAndRender() {
    const { useGitHub } = await import("@/hooks/useGitHub");
    return renderHook(() => useGitHub(), { wrapper });
  }

  it("starts with disconnected initial state", async () => {
    const { result } = await importAndRender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.orgs).toEqual([]);
    expect(result.current.repos).toEqual([]);
    expect(result.current.branches).toEqual([]);
    expect(result.current.files).toEqual([]);
  });

  it("detects connected state on mount via checkStatus", async () => {
    fetchMock.mockImplementation(() =>
      mockFetchResponse({ connected: true, user: mockUser })
    );

    const { result } = await importAndRender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(fetchMock).toHaveBeenCalledWith("/api/github/status");
  });

  it("detects disconnected state on mount via checkStatus", async () => {
    fetchMock.mockImplementation(() =>
      mockFetchResponse({ connected: false, user: null })
    );

    const { result } = await importAndRender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("fetchOrgs returns organizations", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/orgs") {
        return mockFetchResponse(mockOrgs);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchOrgs();
    });

    expect(result.current.orgs).toEqual(mockOrgs);
  });

  it("fetchRepos returns repos for an owner", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.current.owner).toBe("octocat");
    expect(result.current.branches).toEqual([]);
    expect(result.current.files).toEqual([]);
  });

  it("fetchBranches returns branches for owner/repo", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/branches?owner=octocat&repo=repo-1") {
        return mockFetchResponse(mockBranches);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });

    expect(result.current.branches).toEqual(mockBranches);
    expect(result.current.current.repo).toBe("repo-1");
    expect(result.current.files).toEqual([]);
  });

  it("fetchFiles returns files for owner/repo/branch", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/branches?owner=octocat&repo=repo-1") {
        return mockFetchResponse(mockBranches);
      }
      if (url === "/api/github/files?owner=octocat&repo=repo-1&branch=main") {
        return mockFetchResponse(mockFiles);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });
    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });
    await act(async () => {
      await result.current.fetchFiles("main");
    });

    expect(result.current.files).toEqual(mockFiles);
    expect(result.current.current.branch).toBe("main");
  });

  it("fetchFileContent returns file content and updates current path/sha", async () => {
    const fileData = { content: "# Hello World", sha: "file-sha-123" };

    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/files" && options?.method === "POST") {
        return mockFetchResponse(fileData);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    let content: { content: string; sha: string } | null = null;
    await act(async () => {
      content = await result.current.fetchFileContent("README.md");
    });

    expect(content).toEqual(fileData);
    expect(result.current.current.path).toBe("README.md");
    expect(result.current.current.sha).toBe("file-sha-123");
  });

  it("saveFile sends correct payload and updates sha", async () => {
    const savedResponse = { content: { sha: "new-sha-456" } };

    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/save" && options?.method === "POST") {
        return mockFetchResponse(savedResponse);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setCurrent({
        owner: "octocat",
        repo: "repo-1",
        branch: "main",
        path: "README.md",
        sha: "old-sha",
      });
    });

    let saved = false;
    await act(async () => {
      saved = await result.current.saveFile("# Updated", "Update readme");
    });

    expect(saved).toBe(true);
    expect(result.current.current.sha).toBe("new-sha-456");

    const saveCall = fetchMock.mock.calls.find(
      (call: unknown[]) => call[0] === "/api/github/save"
    );
    expect(saveCall).toBeDefined();
    const body = JSON.parse(saveCall![1].body);
    expect(body).toEqual({
      owner: "octocat",
      repo: "repo-1",
      branch: "main",
      path: "README.md",
      content: "# Updated",
      sha: "old-sha",
      message: "Update readme",
    });
  });

  it("disconnect calls unlink endpoint and resets state", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/unlink" && options?.method === "POST") {
        return mockFetchResponse({});
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.orgs).toEqual([]);
    expect(result.current.repos).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith("/api/github/unlink", { method: "POST" });
  });

  it("isLoading is true during fetch and false after", async () => {
    let resolveStatus: (value: unknown) => void;
    fetchMock.mockImplementation(() => {
      return new Promise((resolve) => {
        resolveStatus = resolve;
      });
    });

    const { result } = await importAndRender();

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveStatus!({
        ok: true,
        json: () => Promise.resolve({ connected: false, user: null }),
      });
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("handles failed checkStatus gracefully", async () => {
    fetchMock.mockImplementation(() => Promise.reject(new Error("Network error")));

    const { result } = await importAndRender();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("handles failed fetchOrgs gracefully", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/orgs") {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchOrgs();
    });

    expect(result.current.orgs).toEqual([]);
  });

  it("handles failed fetchRepos gracefully", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url.startsWith("/api/github/repos")) {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    expect(result.current.repos).toEqual([]);
  });

  it("saveFile returns false when no file is selected", async () => {
    fetchMock.mockImplementation(() =>
      mockFetchResponse({ connected: true, user: mockUser })
    );

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let saved = false;
    await act(async () => {
      saved = await result.current.saveFile("content");
    });

    expect(saved).toBe(false);
  });

  it("fetchRepos handles non-ok API response without updating state", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url.startsWith("/api/github/repos")) {
        return mockFetchResponse({ error: "Unauthorized" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    expect(result.current.repos).toEqual([]);
  });

  it("fetchBranches handles network error gracefully", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url.startsWith("/api/github/branches")) {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });

    expect(result.current.branches).toEqual([]);
  });

  it("fetchBranches handles non-ok API response without updating state", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url.startsWith("/api/github/branches")) {
        return mockFetchResponse({ error: "Not found" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });

    expect(result.current.branches).toEqual([]);
  });

  it("fetchFiles handles network error gracefully", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/branches?owner=octocat&repo=repo-1") {
        return mockFetchResponse(mockBranches);
      }
      if (url.startsWith("/api/github/files")) {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });
    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });
    await act(async () => {
      await result.current.fetchFiles("main");
    });

    expect(result.current.files).toEqual([]);
  });

  it("fetchFiles handles non-ok API response without updating state", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/branches?owner=octocat&repo=repo-1") {
        return mockFetchResponse(mockBranches);
      }
      if (url.startsWith("/api/github/files")) {
        return mockFetchResponse({ error: "Forbidden" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });
    await act(async () => {
      await result.current.fetchBranches("repo-1");
    });
    await act(async () => {
      await result.current.fetchFiles("main");
    });

    expect(result.current.files).toEqual([]);
  });

  it("fetchFileContent handles network error and returns null", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/files" && options?.method === "POST") {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    let content: { content: string; sha: string } | null = null;
    await act(async () => {
      content = await result.current.fetchFileContent("README.md");
    });

    expect(content).toBeNull();
  });

  it("fetchFileContent returns null for non-ok API response", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      if (url === "/api/github/files" && options?.method === "POST") {
        return mockFetchResponse({ error: "Not found" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    let content: { content: string; sha: string } | null = null;
    await act(async () => {
      content = await result.current.fetchFileContent("README.md");
    });

    expect(content).toBeNull();
  });

  it("saveFile returns false and reports error when API returns non-ok", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/save" && options?.method === "POST") {
        return mockFetchResponse({ error: "Conflict: file changed" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setCurrent({
        owner: "octocat",
        repo: "repo-1",
        branch: "main",
        path: "README.md",
        sha: "old-sha",
      });
    });

    let saved = false;
    await act(async () => {
      saved = await result.current.saveFile("# Updated");
    });

    expect(saved).toBe(false);
  });

  it("saveFile returns false when fetch throws a network error", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/save" && options?.method === "POST") {
        return Promise.reject(new Error("Network failure"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setCurrent({
        owner: "octocat",
        repo: "repo-1",
        branch: "main",
        path: "README.md",
        sha: "old-sha",
      });
    });

    let saved = false;
    await act(async () => {
      saved = await result.current.saveFile("# Updated");
    });

    expect(saved).toBe(false);
  });

  it("saveFile uses default commit message when none is provided", async () => {
    const savedResponse = { content: { sha: "new-sha" } };

    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/save" && options?.method === "POST") {
        return mockFetchResponse(savedResponse);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.setCurrent({
        owner: "octocat",
        repo: "repo-1",
        branch: "main",
        path: "docs/guide.md",
        sha: "old-sha",
      });
    });

    await act(async () => {
      await result.current.saveFile("# Content");
    });

    const saveCall = fetchMock.mock.calls.find(
      (call: unknown[]) => call[0] === "/api/github/save"
    );
    const body = JSON.parse(saveCall![1].body);
    expect(body.message).toBe("Update docs/guide.md");
  });

  it("fetchOrgs handles non-ok API response without updating state", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/orgs") {
        return mockFetchResponse({ error: "Forbidden" }, false);
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchOrgs();
    });

    expect(result.current.orgs).toEqual([]);
  });

  it("reset clears repos, branches, files, and current selection", async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/repos?owner=octocat") {
        return mockFetchResponse({ items: mockRepos });
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchRepos("octocat");
    });

    expect(result.current.repos.length).toBeGreaterThan(0);

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.repos).toEqual([]);
    expect(result.current.branches).toEqual([]);
    expect(result.current.files).toEqual([]);
    expect(result.current.current.owner).toBe("");
    expect(result.current.current.repo).toBe("");
  });

  it("disconnect handles network error gracefully", async () => {
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      if (url === "/api/github/status") {
        return mockFetchResponse({ connected: true, user: mockUser });
      }
      if (url === "/api/github/unlink" && options?.method === "POST") {
        return Promise.reject(new Error("Network error"));
      }
      return mockFetchResponse({});
    });

    const { result } = await importAndRender();
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await act(async () => {
      await result.current.disconnect();
    });

    // Should remain connected since disconnect failed
    expect(result.current.isConnected).toBe(true);
  });
});
