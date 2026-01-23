# Dillinger Next.js Migration - Phase 2: Cloud Integrations

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GitHub and Dropbox OAuth integrations for importing and saving markdown files to cloud services.

**Architecture:** OAuth tokens stored in HTTP-only cookies, API routes handle all cloud service communication, React hooks manage client-side state for file browsing modals.

**Tech Stack:** Next.js API Routes, GitHub REST API, Dropbox SDK, HTTP-only cookies for token storage

---

## Prerequisites

- Phase 1 complete (core editor working)
- Environment variables configured for OAuth:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `DROPBOX_APP_KEY`
  - `DROPBOX_APP_SECRET`
  - `NEXT_PUBLIC_BASE_URL` (e.g., `http://localhost:3000`)

---

## Phase 2.1: Environment Setup

### Task 2.1.1: Create Environment Configuration

**Files:**
- Create: `next-app/.env.local.example`
- Create: `next-app/.env.local`
- Modify: `next-app/.gitignore`

**Step 1: Create environment example file**

Create `next-app/.env.local.example`:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Dropbox OAuth
DROPBOX_APP_KEY=your_dropbox_app_key
DROPBOX_APP_SECRET=your_dropbox_app_secret

# App URL (for OAuth callbacks)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Step 2: Create actual .env.local (user fills in values)**

```bash
cp .env.local.example .env.local
```
User must fill in actual OAuth credentials.

**Step 3: Ensure .env.local is gitignored**

Verify `.gitignore` contains:
```
.env*.local
```

**Step 4: Commit**

```bash
git add .env.local.example && git commit -m "docs: add environment variables example for OAuth"
```

---

## Phase 2.2: GitHub Integration

### Task 2.2.1: Create GitHub OAuth Routes

**Files:**
- Create: `next-app/app/api/github/oauth/route.ts`
- Create: `next-app/app/api/github/callback/route.ts`

**Step 1: Create OAuth initiation route**

Create `next-app/app/api/github/oauth/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    return NextResponse.json(
      { error: "GitHub OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/github/callback`;
  const scope = "repo,user";

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);

  return NextResponse.redirect(authUrl.toString());
}
```

**Step 2: Create OAuth callback route**

Create `next-app/app/api/github/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}?github_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?github_error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        `${baseUrl}?github_error=${tokenData.error}`
      );
    }

    // Store token in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("github_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return NextResponse.redirect(`${baseUrl}?github_connected=true`);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}?github_error=token_exchange_failed`);
  }
}
```

**Step 3: Commit**

```bash
git add app/api/github/oauth/route.ts app/api/github/callback/route.ts && git commit -m "feat: add GitHub OAuth routes"
```

---

### Task 2.2.2: Create GitHub Status and Unlink Routes

**Files:**
- Create: `next-app/app/api/github/status/route.ts`
- Create: `next-app/app/api/github/unlink/route.ts`

**Step 1: Create status check route**

Create `next-app/app/api/github/status/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ connected: false });
  }

  try {
    // Verify token is still valid by fetching user
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false });
    }

    const user = await response.json();

    return NextResponse.json({
      connected: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}
```

**Step 2: Create unlink route**

Create `next-app/app/api/github/unlink/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("github_token");

  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add app/api/github/status/route.ts app/api/github/unlink/route.ts && git commit -m "feat: add GitHub status and unlink routes"
```

---

### Task 2.2.3: Create GitHub Data Routes

**Files:**
- Create: `next-app/app/api/github/orgs/route.ts`
- Create: `next-app/app/api/github/repos/route.ts`
- Create: `next-app/app/api/github/branches/route.ts`
- Create: `next-app/app/api/github/files/route.ts`

**Step 1: Create orgs route**

Create `next-app/app/api/github/orgs/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Fetch user first
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const user = await userResponse.json();

    // Fetch organizations
    const orgsResponse = await fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const orgs = await orgsResponse.json();

    // Prepend user as first "org" option
    const allOrgs = [{ login: user.login, type: "user" }, ...orgs];

    return NextResponse.json(allOrgs);
  } catch (error) {
    console.error("GitHub orgs error:", error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}
```

**Step 2: Create repos route**

Create `next-app/app/api/github/repos/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "30";

  if (!owner) {
    return NextResponse.json({ error: "Owner is required" }, { status: 400 });
  }

  try {
    // Check if owner is the authenticated user
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const user = await userResponse.json();

    let url: string;
    if (owner === user.login) {
      url = `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`;
    } else {
      url = `https://api.github.com/orgs/${owner}/repos?page=${page}&per_page=${perPage}&sort=updated`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    return NextResponse.json({
      items: repos.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        default_branch: repo.default_branch,
      })),
    });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
```

**Step 3: Create branches route**

Create `next-app/app/api/github/branches/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const branches = await response.json();

    return NextResponse.json(
      branches.map((branch: any) => ({
        name: branch.name,
        sha: branch.commit.sha,
      }))
    );
  } catch (error) {
    console.error("GitHub branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
```

**Step 4: Create files route**

Create `next-app/app/api/github/files/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch");
  const path = searchParams.get("path") || "";

  if (!owner || !repo || !branch) {
    return NextResponse.json(
      { error: "Owner, repo, and branch are required" },
      { status: 400 }
    );
  }

  try {
    // Get the tree for the branch
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

    const response = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for markdown files
    const markdownFiles = data.tree.filter(
      (item: any) =>
        item.type === "blob" &&
        (item.path.endsWith(".md") || item.path.endsWith(".markdown"))
    );

    return NextResponse.json(
      markdownFiles.map((file: any) => ({
        path: file.path,
        sha: file.sha,
        url: file.url,
      }))
    );
  } catch (error) {
    console.error("GitHub files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// Fetch single file content
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { owner, repo, path } = await request.json();

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Owner, repo, and path are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
      content,
      sha: data.sha,
      path: data.path,
    });
  } catch (error) {
    console.error("GitHub file fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
```

**Step 5: Commit**

```bash
git add app/api/github/orgs/route.ts app/api/github/repos/route.ts app/api/github/branches/route.ts app/api/github/files/route.ts && git commit -m "feat: add GitHub data routes (orgs, repos, branches, files)"
```

---

### Task 2.2.4: Create GitHub Save Route

**Files:**
- Create: `next-app/app/api/github/save/route.ts`

**Step 1: Create save route**

Create `next-app/app/api/github/save/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { owner, repo, path, content, sha, message, branch } =
      await request.json();

    if (!owner || !repo || !path || !content || !branch) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encode content to base64
    const encodedContent = Buffer.from(content).toString("base64");

    const body: any = {
      message: message || `Update ${path}`,
      content: encodedContent,
      branch,
    };

    // Include SHA if updating existing file
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      content: {
        path: data.content.path,
        sha: data.content.sha,
      },
    });
  } catch (error: any) {
    console.error("GitHub save error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save file" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/github/save/route.ts && git commit -m "feat: add GitHub save route"
```

---

### Task 2.2.5: Create GitHub Hook

**Files:**
- Create: `next-app/hooks/useGitHub.ts`

**Step 1: Create GitHub hook**

Create `next-app/hooks/useGitHub.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
}

interface GitHubOrg {
  login: string;
  type?: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
}

interface GitHubBranch {
  name: string;
  sha: string;
}

interface GitHubFile {
  path: string;
  sha: string;
  url: string;
}

interface GitHubState {
  isConnected: boolean;
  isLoading: boolean;
  user: GitHubUser | null;
  orgs: GitHubOrg[];
  repos: GitHubRepo[];
  branches: GitHubBranch[];
  files: GitHubFile[];
  current: {
    owner: string;
    repo: string;
    branch: string;
    path: string;
    sha: string;
  };
}

const initialCurrent = {
  owner: "",
  repo: "",
  branch: "",
  path: "",
  sha: "",
};

export function useGitHub() {
  const [state, setState] = useState<GitHubState>({
    isConnected: false,
    isLoading: true,
    user: null,
    orgs: [],
    repos: [],
    branches: [],
    files: [],
    current: initialCurrent,
  });

  const { notify } = useToast();

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/github/status");
      const data = await response.json();

      setState((s) => ({
        ...s,
        isConnected: data.connected,
        user: data.user || null,
        isLoading: false,
      }));
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/github/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/github/unlink", { method: "POST" });
      setState((s) => ({
        ...s,
        isConnected: false,
        user: null,
        orgs: [],
        repos: [],
        branches: [],
        files: [],
        current: initialCurrent,
      }));
      notify("Disconnected from GitHub");
    } catch (error) {
      notify("Failed to disconnect");
    }
  }, [notify]);

  const fetchOrgs = useCallback(async () => {
    try {
      notify("Fetching organizations...", 2000);
      const response = await fetch("/api/github/orgs");
      const data = await response.json();

      if (response.ok) {
        setState((s) => ({ ...s, orgs: data }));
      }
    } catch (error) {
      notify("Failed to fetch organizations");
    }
  }, [notify]);

  const fetchRepos = useCallback(
    async (owner: string) => {
      try {
        notify("Fetching repositories...", 2000);
        const response = await fetch(`/api/github/repos?owner=${owner}`);
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            repos: data.items,
            branches: [],
            files: [],
            current: { ...initialCurrent, owner },
          }));
        }
      } catch (error) {
        notify("Failed to fetch repositories");
      }
    },
    [notify]
  );

  const fetchBranches = useCallback(
    async (repo: string) => {
      const { owner } = state.current;
      try {
        notify("Fetching branches...", 2000);
        const response = await fetch(
          `/api/github/branches?owner=${owner}&repo=${repo}`
        );
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            branches: data,
            files: [],
            current: { ...s.current, repo, branch: "", path: "", sha: "" },
          }));
        }
      } catch (error) {
        notify("Failed to fetch branches");
      }
    },
    [state.current.owner, notify]
  );

  const fetchFiles = useCallback(
    async (branch: string) => {
      const { owner, repo } = state.current;
      try {
        notify("Fetching files...", 2000);
        const response = await fetch(
          `/api/github/files?owner=${owner}&repo=${repo}&branch=${branch}`
        );
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            files: data,
            current: { ...s.current, branch, path: "", sha: "" },
          }));
        }
      } catch (error) {
        notify("Failed to fetch files");
      }
    },
    [state.current.owner, state.current.repo, notify]
  );

  const fetchFileContent = useCallback(
    async (path: string): Promise<{ content: string; sha: string } | null> => {
      const { owner, repo } = state.current;
      try {
        notify("Fetching file...", 2000);
        const response = await fetch("/api/github/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, path }),
        });
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            current: { ...s.current, path, sha: data.sha },
          }));
          return { content: data.content, sha: data.sha };
        }
        return null;
      } catch (error) {
        notify("Failed to fetch file");
        return null;
      }
    },
    [state.current.owner, state.current.repo, notify]
  );

  const saveFile = useCallback(
    async (content: string, message?: string): Promise<boolean> => {
      const { owner, repo, branch, path, sha } = state.current;

      if (!owner || !repo || !branch || !path) {
        notify("No file selected for saving");
        return false;
      }

      try {
        notify("Saving to GitHub...", 3000);
        const response = await fetch("/api/github/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            repo,
            branch,
            path,
            content,
            sha,
            message: message || `Update ${path}`,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            current: { ...s.current, sha: data.content.sha },
          }));
          notify("Successfully saved to GitHub!");
          return true;
        } else {
          throw new Error(data.error);
        }
      } catch (error: any) {
        notify(`Failed to save: ${error.message}`);
        return false;
      }
    },
    [state.current, notify]
  );

  const setCurrent = useCallback(
    (updates: Partial<typeof state.current>) => {
      setState((s) => ({
        ...s,
        current: { ...s.current, ...updates },
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      repos: [],
      branches: [],
      files: [],
      current: initialCurrent,
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    fetchOrgs,
    fetchRepos,
    fetchBranches,
    fetchFiles,
    fetchFileContent,
    saveFile,
    setCurrent,
    reset,
  };
}
```

**Step 2: Commit**

```bash
git add hooks/useGitHub.ts && git commit -m "feat: add useGitHub hook for GitHub integration"
```

---

### Task 2.2.6: Create GitHub Modal

**Files:**
- Create: `next-app/components/modals/GitHubModal.tsx`

**Step 1: Create GitHub modal component**

Create `next-app/components/modals/GitHubModal.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useGitHub } from "@/hooks/useGitHub";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  Github,
  ChevronRight,
  ArrowLeft,
  Folder,
  FileText,
  Check,
  Save,
} from "lucide-react";

type Step = "orgs" | "repos" | "branches" | "files";
type Mode = "import" | "save";

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function GitHubModal({ isOpen, onClose, mode }: GitHubModalProps) {
  const github = useGitHub();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);

  const [step, setStep] = useState<Step>("orgs");
  const [commitMessage, setCommitMessage] = useState("");
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    if (isOpen && github.isConnected) {
      github.fetchOrgs();
      setStep("orgs");
      setCommitMessage("");
      setNewFileName(currentDocument?.title || "document");
    }
  }, [isOpen, github.isConnected]);

  if (!isOpen) return null;

  const handleOrgSelect = (org: string) => {
    github.fetchRepos(org);
    setStep("repos");
  };

  const handleRepoSelect = (repo: string) => {
    github.fetchBranches(repo);
    setStep("branches");
  };

  const handleBranchSelect = (branch: string) => {
    github.fetchFiles(branch);
    setStep("files");
  };

  const handleFileSelect = async (path: string) => {
    if (mode === "import") {
      const file = await github.fetchFileContent(path);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(path.split("/").pop()?.replace(/\.md$/, "") || "Untitled");
        notify("File imported from GitHub");
        onClose();
      }
    } else {
      // For save mode, select the file to overwrite
      github.setCurrent({ path, sha: github.files.find((f) => f.path === path)?.sha });
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const path = github.current.path || `${newFileName}.md`;
    github.setCurrent({ path });

    const success = await github.saveFile(
      currentDocument.body,
      commitMessage || `Update ${path}`
    );

    if (success) {
      onClose();
    }
  };

  const goBack = () => {
    if (step === "repos") setStep("orgs");
    else if (step === "branches") setStep("repos");
    else if (step === "files") setStep("branches");
  };

  // Not connected state
  if (!github.isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Github size={48} className="mx-auto text-text-invert mb-4" />
            <h2 className="text-xl font-semibold text-text-invert mb-2">
              Connect to GitHub
            </h2>
            <p className="text-text-muted mb-6">
              Connect your GitHub account to import and save markdown files.
            </p>
            <button
              onClick={github.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity"
            >
              Connect GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {step !== "orgs" && (
              <button
                onClick={goBack}
                className="text-text-invert hover:text-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Github size={24} className="text-text-invert" />
            <h2 className="text-lg font-semibold text-text-invert">
              {mode === "import" ? "Import from GitHub" : "Save to GitHub"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 text-sm text-text-muted flex items-center gap-1 border-b border-border-settings">
          {github.current.owner && (
            <>
              <span>{github.current.owner}</span>
              {github.current.repo && (
                <>
                  <ChevronRight size={14} />
                  <span>{github.current.repo}</span>
                </>
              )}
              {github.current.branch && (
                <>
                  <ChevronRight size={14} />
                  <span>{github.current.branch}</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {step === "orgs" && (
            <div className="space-y-1">
              {github.orgs.map((org) => (
                <button
                  key={org.login}
                  onClick={() => handleOrgSelect(org.login)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <span>{org.login}</span>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "repos" && (
            <div className="space-y-1">
              {github.repos.map((repo) => (
                <button
                  key={repo.name}
                  onClick={() => handleRepoSelect(repo.name)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Folder size={16} className="text-text-muted" />
                    <span>{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs bg-bg-highlight px-1.5 py-0.5 rounded">
                        Private
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "branches" && (
            <div className="space-y-1">
              {github.branches.map((branch) => (
                <button
                  key={branch.name}
                  onClick={() => handleBranchSelect(branch.name)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center justify-between"
                >
                  <span>{branch.name}</span>
                  <ChevronRight size={16} className="text-text-muted" />
                </button>
              ))}
            </div>
          )}

          {step === "files" && (
            <div className="space-y-1">
              {mode === "save" && (
                <div className="mb-4 p-3 bg-bg-highlight rounded">
                  <label className="block text-sm text-text-muted mb-1">
                    File name
                  </label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="document.md"
                    className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                               border border-border-settings focus:border-plum outline-none"
                  />
                  <label className="block text-sm text-text-muted mb-1 mt-3">
                    Commit message
                  </label>
                  <input
                    type="text"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Update document"
                    className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                               border border-border-settings focus:border-plum outline-none"
                  />
                </div>
              )}

              {github.files.length === 0 ? (
                <p className="text-text-muted text-center py-4">
                  No markdown files found
                </p>
              ) : (
                github.files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleFileSelect(file.path)}
                    className={`w-full text-left px-3 py-2 rounded text-text-invert
                               hover:bg-bg-highlight flex items-center justify-between
                               ${github.current.path === file.path ? "bg-bg-highlight" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-text-muted" />
                      <span>{file.path}</span>
                    </div>
                    {github.current.path === file.path && (
                      <Check size={16} className="text-plum" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && step === "files" && (
          <div className="p-4 border-t border-border-settings">
            <button
              onClick={handleSave}
              className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save to GitHub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/modals/GitHubModal.tsx && git commit -m "feat: add GitHubModal component"
```

---

## Phase 2.3: Dropbox Integration

### Task 2.3.1: Install Dropbox SDK

**Step 1: Install dependency**

```bash
npm install dropbox
```

**Step 2: Commit**

```bash
git add package.json package-lock.json && git commit -m "feat: add Dropbox SDK dependency"
```

---

### Task 2.3.2: Create Dropbox OAuth Routes

**Files:**
- Create: `next-app/app/api/dropbox/oauth/route.ts`
- Create: `next-app/app/api/dropbox/callback/route.ts`
- Create: `next-app/app/api/dropbox/status/route.ts`
- Create: `next-app/app/api/dropbox/unlink/route.ts`

**Step 1: Create OAuth initiation route**

Create `next-app/app/api/dropbox/oauth/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { Dropbox } from "dropbox";

export async function GET() {
  const clientId = process.env.DROPBOX_APP_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    return NextResponse.json(
      { error: "Dropbox OAuth not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/dropbox/callback`;

  const dbx = new Dropbox({ clientId });
  const authUrl = await dbx.auth.getAuthenticationUrl(
    redirectUri,
    undefined,
    "code",
    "offline",
    undefined,
    undefined,
    false
  );

  return NextResponse.redirect(authUrl.toString());
}
```

**Step 2: Create callback route**

Create `next-app/app/api/dropbox/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(`${baseUrl}?dropbox_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?dropbox_error=no_code`);
  }

  try {
    const clientId = process.env.DROPBOX_APP_KEY!;
    const clientSecret = process.env.DROPBOX_APP_SECRET!;
    const redirectUri = `${baseUrl}/api/dropbox/callback`;

    const dbx = new Dropbox({ clientId, clientSecret });
    const token = await dbx.auth.getAccessTokenFromCode(redirectUri, code);

    const result = token.result as any;

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(
      "dropbox_token",
      JSON.stringify({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      }
    );

    return NextResponse.redirect(`${baseUrl}?dropbox_connected=true`);
  } catch (error) {
    console.error("Dropbox OAuth error:", error);
    return NextResponse.redirect(`${baseUrl}?dropbox_error=token_exchange_failed`);
  }
}
```

**Step 3: Create status route**

Create `next-app/app/api/dropbox/status/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

export async function GET() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ connected: false });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);

    const dbx = new Dropbox({ accessToken: access_token });
    const account = await dbx.usersGetCurrentAccount();

    return NextResponse.json({
      connected: true,
      user: {
        name: account.result.name.display_name,
        email: account.result.email,
      },
    });
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}
```

**Step 4: Create unlink route**

Create `next-app/app/api/dropbox/unlink/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("dropbox_token");

  return NextResponse.json({ success: true });
}
```

**Step 5: Commit**

```bash
git add app/api/dropbox/ && git commit -m "feat: add Dropbox OAuth routes"
```

---

### Task 2.3.3: Create Dropbox Data Routes

**Files:**
- Create: `next-app/app/api/dropbox/files/route.ts`
- Create: `next-app/app/api/dropbox/save/route.ts`

**Step 1: Create files route**

Create `next-app/app/api/dropbox/files/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

// List markdown files
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "";

    const response = await dbx.filesListFolder({
      path: path || "",
      recursive: false,
    });

    // Filter for markdown files and folders
    const items = response.result.entries
      .filter(
        (entry) =>
          entry[".tag"] === "folder" ||
          entry.name.endsWith(".md") ||
          entry.name.endsWith(".markdown")
      )
      .map((entry) => ({
        name: entry.name,
        path: entry.path_lower,
        isFolder: entry[".tag"] === "folder",
      }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Dropbox files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// Fetch file content
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { path } = await request.json();
    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    const response = await dbx.filesDownload({ path });
    const result = response.result as any;

    // Get file content from the blob
    const content = await (result.fileBlob as Blob).text();

    return NextResponse.json({
      content,
      name: result.name,
      path: result.path_lower,
    });
  } catch (error) {
    console.error("Dropbox file fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
```

**Step 2: Create save route**

Create `next-app/app/api/dropbox/save/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Dropbox } from "dropbox";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("dropbox_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { path, content } = await request.json();

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: "Path and content are required" },
        { status: 400 }
      );
    }

    const { access_token } = JSON.parse(tokenCookie);
    const dbx = new Dropbox({ accessToken: access_token });

    // Ensure path starts with /
    const filePath = path.startsWith("/") ? path : `/${path}`;

    const response = await dbx.filesUpload({
      path: filePath,
      contents: content,
      mode: { ".tag": "overwrite" },
    });

    return NextResponse.json({
      success: true,
      path: response.result.path_lower,
      name: response.result.name,
    });
  } catch (error) {
    console.error("Dropbox save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
```

**Step 3: Commit**

```bash
git add app/api/dropbox/files/route.ts app/api/dropbox/save/route.ts && git commit -m "feat: add Dropbox files and save routes"
```

---

### Task 2.3.4: Create Dropbox Hook

**Files:**
- Create: `next-app/hooks/useDropbox.ts`

**Step 1: Create Dropbox hook**

Create `next-app/hooks/useDropbox.ts`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";

interface DropboxUser {
  name: string;
  email: string;
}

interface DropboxFile {
  name: string;
  path: string;
  isFolder: boolean;
}

interface DropboxState {
  isConnected: boolean;
  isLoading: boolean;
  user: DropboxUser | null;
  files: DropboxFile[];
  currentPath: string;
  pathHistory: string[];
}

export function useDropbox() {
  const [state, setState] = useState<DropboxState>({
    isConnected: false,
    isLoading: true,
    user: null,
    files: [],
    currentPath: "",
    pathHistory: [],
  });

  const { notify } = useToast();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/dropbox/status");
      const data = await response.json();

      setState((s) => ({
        ...s,
        isConnected: data.connected,
        user: data.user || null,
        isLoading: false,
      }));
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/dropbox/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/dropbox/unlink", { method: "POST" });
      setState((s) => ({
        ...s,
        isConnected: false,
        user: null,
        files: [],
        currentPath: "",
        pathHistory: [],
      }));
      notify("Disconnected from Dropbox");
    } catch (error) {
      notify("Failed to disconnect");
    }
  }, [notify]);

  const fetchFiles = useCallback(
    async (path: string = "") => {
      try {
        notify("Fetching files...", 2000);
        const response = await fetch(`/api/dropbox/files?path=${encodeURIComponent(path)}`);
        const data = await response.json();

        if (response.ok) {
          setState((s) => ({
            ...s,
            files: data,
            currentPath: path,
          }));
        }
      } catch (error) {
        notify("Failed to fetch files");
      }
    },
    [notify]
  );

  const navigateToFolder = useCallback(
    async (path: string) => {
      setState((s) => ({
        ...s,
        pathHistory: [...s.pathHistory, s.currentPath],
      }));
      await fetchFiles(path);
    },
    [fetchFiles]
  );

  const navigateBack = useCallback(async () => {
    setState((s) => {
      const newHistory = [...s.pathHistory];
      const previousPath = newHistory.pop() || "";
      return {
        ...s,
        pathHistory: newHistory,
        currentPath: previousPath,
      };
    });

    const previousPath = state.pathHistory[state.pathHistory.length - 1] || "";
    await fetchFiles(previousPath);
  }, [fetchFiles, state.pathHistory]);

  const fetchFileContent = useCallback(
    async (path: string): Promise<{ content: string; name: string } | null> => {
      try {
        notify("Fetching file...", 2000);
        const response = await fetch("/api/dropbox/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const data = await response.json();

        if (response.ok) {
          return { content: data.content, name: data.name };
        }
        return null;
      } catch (error) {
        notify("Failed to fetch file");
        return null;
      }
    },
    [notify]
  );

  const saveFile = useCallback(
    async (path: string, content: string): Promise<boolean> => {
      try {
        notify("Saving to Dropbox...", 3000);
        const response = await fetch("/api/dropbox/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content }),
        });

        if (response.ok) {
          notify("Successfully saved to Dropbox!");
          return true;
        } else {
          const data = await response.json();
          throw new Error(data.error);
        }
      } catch (error: any) {
        notify(`Failed to save: ${error.message}`);
        return false;
      }
    },
    [notify]
  );

  const reset = useCallback(() => {
    setState((s) => ({
      ...s,
      files: [],
      currentPath: "",
      pathHistory: [],
    }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    fetchFiles,
    navigateToFolder,
    navigateBack,
    fetchFileContent,
    saveFile,
    reset,
  };
}
```

**Step 2: Commit**

```bash
git add hooks/useDropbox.ts && git commit -m "feat: add useDropbox hook for Dropbox integration"
```

---

### Task 2.3.5: Create Dropbox Modal

**Files:**
- Create: `next-app/components/modals/DropboxModal.tsx`

**Step 1: Create Dropbox modal component**

Create `next-app/components/modals/DropboxModal.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useDropbox } from "@/hooks/useDropbox";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  Cloud,
  ArrowLeft,
  Folder,
  FileText,
  Save,
} from "lucide-react";

type Mode = "import" | "save";

interface DropboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function DropboxModal({ isOpen, onClose, mode }: DropboxModalProps) {
  const dropbox = useDropbox();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);

  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    if (isOpen && dropbox.isConnected) {
      dropbox.fetchFiles("");
      setNewFileName(currentDocument?.title || "document");
    }
  }, [isOpen, dropbox.isConnected]);

  if (!isOpen) return null;

  const handleItemClick = async (item: { name: string; path: string; isFolder: boolean }) => {
    if (item.isFolder) {
      dropbox.navigateToFolder(item.path);
    } else if (mode === "import") {
      const file = await dropbox.fetchFileContent(item.path);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(file.name.replace(/\.md$/, ""));
        notify("File imported from Dropbox");
        onClose();
      }
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const fileName = newFileName.endsWith(".md") ? newFileName : `${newFileName}.md`;
    const path = dropbox.currentPath ? `${dropbox.currentPath}/${fileName}` : `/${fileName}`;

    const success = await dropbox.saveFile(path, currentDocument.body);
    if (success) {
      onClose();
    }
  };

  // Not connected state
  if (!dropbox.isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <Cloud size={48} className="mx-auto text-text-invert mb-4" />
            <h2 className="text-xl font-semibold text-text-invert mb-2">
              Connect to Dropbox
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Dropbox account to import and save markdown files.
            </p>
            <button
              onClick={dropbox.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity"
            >
              Connect Dropbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {dropbox.pathHistory.length > 0 && (
              <button
                onClick={dropbox.navigateBack}
                className="text-text-invert hover:text-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Cloud size={24} className="text-text-invert" />
            <h2 className="text-lg font-semibold text-text-invert">
              {mode === "import" ? "Import from Dropbox" : "Save to Dropbox"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-invert hover:text-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current path */}
        <div className="px-4 py-2 text-sm text-text-muted border-b border-border-settings">
          {dropbox.currentPath || "/"}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {mode === "save" && (
            <div className="mb-4 p-3 bg-bg-highlight rounded">
              <label className="block text-sm text-text-muted mb-1">
                File name
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="document.md"
                className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                           border border-border-settings focus:border-plum outline-none"
              />
            </div>
          )}

          {dropbox.files.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              No files found
            </p>
          ) : (
            <div className="space-y-1">
              {dropbox.files.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center gap-2"
                >
                  {item.isFolder ? (
                    <Folder size={16} className="text-text-muted" />
                  ) : (
                    <FileText size={16} className="text-text-muted" />
                  )}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === "save" && (
          <div className="p-4 border-t border-border-settings">
            <button
              onClick={handleSave}
              className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save to Dropbox
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/modals/DropboxModal.tsx && git commit -m "feat: add DropboxModal component"
```

---

## Phase 2.4: Integration with Main App

### Task 2.4.1: Update Sidebar with Cloud Services

**Files:**
- Modify: `next-app/components/sidebar/Sidebar.tsx`

**Step 1: Update Sidebar to include cloud service buttons**

Update `next-app/components/sidebar/Sidebar.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { useGitHub } from "@/hooks/useGitHub";
import { useDropbox } from "@/hooks/useDropbox";
import { DocumentList } from "./DocumentList";
import { GitHubModal } from "@/components/modals/GitHubModal";
import { DropboxModal } from "@/components/modals/DropboxModal";
import {
  Plus,
  Save,
  Trash2,
  Github,
  Cloud,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const createDocument = useStore((state) => state.createDocument);
  const deleteDocument = useStore((state) => state.deleteDocument);
  const persist = useStore((state) => state.persist);
  const { notify } = useToast();

  const github = useGitHub();
  const dropbox = useDropbox();

  const [servicesOpen, setServicesOpen] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  const [githubModal, setGithubModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });
  const [dropboxModal, setDropboxModal] = useState<{ open: boolean; mode: "import" | "save" }>({
    open: false,
    mode: "import",
  });

  const handleSave = () => {
    persist();
    notify("Documents saved");
  };

  const handleDelete = () => {
    if (!currentDocument) return;
    if (documents.length <= 1) {
      notify("Cannot delete the last document");
      return;
    }
    deleteDocument(currentDocument.id);
    notify("Document deleted");
  };

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="w-sidebar bg-bg-sidebar h-screen flex flex-col z-sidebar">
        {/* Logo */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-plum">DILLINGER</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto px-4">
          {/* Services Section */}
          <div className="mb-2">
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Services</span>
              {servicesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {servicesOpen && (
              <div className="ml-2 space-y-1">
                <ServiceButton
                  icon={<Github size={16} />}
                  label="GitHub"
                  connected={github.isConnected}
                  onConnect={github.connect}
                  onDisconnect={github.disconnect}
                />
                <ServiceButton
                  icon={<Cloud size={16} />}
                  label="Dropbox"
                  connected={dropbox.isConnected}
                  onConnect={dropbox.connect}
                  onDisconnect={dropbox.disconnect}
                />
              </div>
            )}
          </div>

          {/* Import From Section */}
          <div className="mb-2">
            <button
              onClick={() => setImportOpen(!importOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Import from</span>
              {importOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {importOpen && (
              <div className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "import" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Save To Section */}
          <div className="mb-2">
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Save to</span>
              {saveOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {saveOpen && (
              <div className="ml-2 space-y-1">
                <button
                  onClick={() => setGithubModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </button>
                <button
                  onClick={() => setDropboxModal({ open: true, mode: "save" })}
                  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight"
                >
                  <Cloud size={16} />
                  <span>Dropbox</span>
                </button>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="mb-2">
            <button
              onClick={() => setDocumentsOpen(!documentsOpen)}
              className="w-full flex items-center justify-between py-2 text-text-invert text-sm"
            >
              <span>Documents</span>
              {documentsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {documentsOpen && (
              <div className="ml-2">
                <DocumentList />
              </div>
            )}
          </div>
        </nav>

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={createDocument}
            className="w-full bg-plum text-bg-sidebar py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Document
          </button>
          <button
            onClick={handleSave}
            className="w-full bg-bg-button-save text-text-invert py-2 px-4 rounded font-medium
                       hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Session
          </button>
          {documents.length > 1 && (
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 text-text-invert py-2 px-4 rounded font-medium
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Delete Document
            </button>
          )}
        </div>
      </aside>

      {/* Modals */}
      <GitHubModal
        isOpen={githubModal.open}
        onClose={() => setGithubModal({ ...githubModal, open: false })}
        mode={githubModal.mode}
      />
      <DropboxModal
        isOpen={dropboxModal.open}
        onClose={() => setDropboxModal({ ...dropboxModal, open: false })}
        mode={dropboxModal.mode}
      />
    </>
  );
}

function ServiceButton({
  icon,
  label,
  connected,
  onConnect,
  onDisconnect,
}: {
  icon: React.ReactNode;
  label: string;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-2 text-sm">
      <div className="flex items-center gap-2 text-dropdown-link">
        {icon}
        <span>{label}</span>
      </div>
      {connected ? (
        <button
          onClick={onDisconnect}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Unlink
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="text-xs text-plum hover:opacity-80"
        >
          Link
        </button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/sidebar/Sidebar.tsx && git commit -m "feat: integrate GitHub and Dropbox into Sidebar"
```

---

### Task 2.4.2: Final Verification

**Step 1: Run development server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] GitHub OAuth flow works (link/unlink)
- [ ] Can browse GitHub orgs → repos → branches → files
- [ ] Can import markdown file from GitHub
- [ ] Can save document to GitHub (new file and update existing)
- [ ] Dropbox OAuth flow works (link/unlink)
- [ ] Can browse Dropbox folders and files
- [ ] Can import markdown file from Dropbox
- [ ] Can save document to Dropbox
- [ ] All Phase 1 features still work

**Step 3: Run build**

```bash
npm run build
```
Expected: Build succeeds without errors

**Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete Phase 2 - GitHub and Dropbox integrations"
```

---

## Summary

Phase 2 adds cloud integrations:

**Completed:**
- GitHub OAuth flow (connect/disconnect)
- GitHub file browsing (orgs → repos → branches → files)
- GitHub import and save
- Dropbox OAuth flow (connect/disconnect)
- Dropbox file browsing
- Dropbox import and save
- Updated Sidebar with Services, Import, and Save sections

**Environment Variables Required:**
```
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
DROPBOX_APP_KEY=xxx
DROPBOX_APP_SECRET=xxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Deferred to Phase 3:**
- Google Drive integration
- OneDrive integration
- Medium integration
- Bitbucket integration
- Resizable editor/preview panels
- Vim/Emacs keybindings
- Word count display
