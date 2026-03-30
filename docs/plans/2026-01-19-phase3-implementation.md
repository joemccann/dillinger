# Phase 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement all Phase 3 features: Google Drive, OneDrive, Bitbucket, Medium integrations, Zen mode, scroll sync, and file handling.

**Architecture:** Follow established patterns from Phase 2 - OAuth via API routes with HTTP-only cookies, React hooks for service state, modal UI for file browsing. Direct REST API calls (no SDKs) for cloud services.

**Tech Stack:** Next.js 14 App Router, TypeScript, Zustand, Tailwind CSS, Monaco Editor

**Verification:** After each task, run `npx tsc --noEmit && npm run lint` to verify. Start dev server with `npm run dev` for manual testing.

---

## Part 1: Google Drive Integration

### Task 1: Add Google Drive Environment Variables

**Files:**
- Modify: `.env.local`
- Modify: `app/api/` (reference only)

**Step 1: Add environment variables to .env.local**

```env
# Google Drive OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Step 2: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: add Google Drive env variables placeholder"
```

---

### Task 2: Create Google Drive OAuth Route

**Files:**
- Create: `app/api/google-drive/oauth/route.ts`

**Step 1: Create the OAuth initiation route**

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google Drive not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google-drive/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/oauth/route.ts
git commit -m "feat: add Google Drive OAuth initiation route"
```

---

### Task 3: Create Google Drive Callback Route

**Files:**
- Create: `app/api/google-drive/callback/route.ts`

**Step 1: Create the callback route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?error=google_auth_failed", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/google-drive/callback`;

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange failed:", errorData);
      return NextResponse.redirect(new URL("/?error=google_token_failed", request.url));
    }

    const tokens = await tokenResponse.json();

    // Store tokens in HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("google_drive_token", JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in * 1000),
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(new URL("/?google_connected=true", request.url));
  } catch (error) {
    console.error("Google Drive callback error:", error);
    return NextResponse.redirect(new URL("/?error=google_callback_failed", request.url));
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/callback/route.ts
git commit -m "feat: add Google Drive OAuth callback route"
```

---

### Task 4: Create Google Drive Status Route

**Files:**
- Create: `app/api/google-drive/status/route.ts`

**Step 1: Create the status route**

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("google_drive_token");

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // Verify token is still valid by calling userinfo
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      // Token expired or invalid
      return NextResponse.json({ connected: false });
    }

    const userInfo = await response.json();

    return NextResponse.json({
      connected: true,
      email: userInfo.email,
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json({ connected: false });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/status/route.ts
git commit -m "feat: add Google Drive status route"
```

---

### Task 5: Create Google Drive Unlink Route

**Files:**
- Create: `app/api/google-drive/unlink/route.ts`

**Step 1: Create the unlink route**

```typescript
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("google_drive_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Drive unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink Google Drive" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/unlink/route.ts
git commit -m "feat: add Google Drive unlink route"
```

---

### Task 6: Create Google Drive Files Route

**Files:**
- Create: `app/api/google-drive/files/route.ts`

**Step 1: Create the files route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_drive_token");

  if (!tokenCookie) return null;

  const tokens = JSON.parse(tokenCookie.value);
  return tokens.access_token;
}

// GET: List files in a folder
export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get("folderId") || "root";

  try {
    // Query for folders and markdown files
    const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or name contains '.md')`;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&orderBy=folder,name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Drive list files error:", error);
      return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
    }

    const data = await response.json();

    const files = data.files.map((file: { id: string; name: string; mimeType: string }) => ({
      id: file.id,
      name: file.name,
      isFolder: file.mimeType === "application/vnd.google-apps.folder",
    }));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Google Drive files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// POST: Get file content
export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { fileId } = await request.json();

    // Get file metadata first
    const metaResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metaResponse.ok) {
      return NextResponse.json({ error: "Failed to get file metadata" }, { status: 500 });
    }

    const metadata = await metaResponse.json();

    // Download file content
    const contentResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!contentResponse.ok) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const content = await contentResponse.text();

    return NextResponse.json({
      name: metadata.name,
      content,
    });
  } catch (error) {
    console.error("Google Drive file content error:", error);
    return NextResponse.json({ error: "Failed to fetch file content" }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/files/route.ts
git commit -m "feat: add Google Drive files route"
```

---

### Task 7: Create Google Drive Save Route

**Files:**
- Create: `app/api/google-drive/save/route.ts`

**Step 1: Create the save route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_drive_token");

  if (!tokenCookie) return null;

  const tokens = JSON.parse(tokenCookie.value);
  return tokens.access_token;
}

export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { name, content, folderId, fileId } = await request.json();

    const metadata = {
      name: name.endsWith(".md") ? name : `${name}.md`,
      mimeType: "text/markdown",
      ...(folderId && !fileId ? { parents: [folderId] } : {}),
    };

    // Use multipart upload
    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: text/markdown\r\n\r\n" +
      content +
      closeDelimiter;

    let url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    let method = "POST";

    // If fileId provided, update existing file
    if (fileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      method = "PATCH";
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Drive save error:", error);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      fileId: result.id,
      name: result.name,
    });
  } catch (error) {
    console.error("Google Drive save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/api/google-drive/save/route.ts
git commit -m "feat: add Google Drive save route"
```

---

### Task 8: Create useGoogleDrive Hook

**Files:**
- Create: `hooks/useGoogleDrive.ts`

**Step 1: Create the hook**

```typescript
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

interface DriveFile {
  id: string;
  name: string;
  isFolder: boolean;
}

interface FileContent {
  name: string;
  content: string;
}

interface GoogleDriveState {
  isConnected: boolean;
  files: DriveFile[];
  currentFolderId: string;
  pathHistory: string[];
}

export function useGoogleDrive() {
  const { notify } = useToast();
  const [state, setState] = useState<GoogleDriveState>({
    isConnected: false,
    files: [],
    currentFolderId: "root",
    pathHistory: [],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/google-drive/status");
        const data = await response.json();
        setState((prev) => ({ ...prev, isConnected: data.connected }));
      } catch (error) {
        console.error("Failed to check Google Drive status:", error);
      }
    };
    checkStatus();
  }, []);

  const connect = useCallback(() => {
    window.location.href = "/api/google-drive/oauth";
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await fetch("/api/google-drive/unlink", { method: "POST" });
      setState({
        isConnected: false,
        files: [],
        currentFolderId: "root",
        pathHistory: [],
      });
      notify("Google Drive disconnected");
    } catch (error) {
      console.error("Failed to disconnect Google Drive:", error);
      notify("Failed to disconnect Google Drive");
    }
  }, [notify]);

  const fetchFiles = useCallback(async (folderId?: string) => {
    const targetFolderId = folderId || stateRef.current.currentFolderId;
    try {
      const response = await fetch(`/api/google-drive/files?folderId=${targetFolderId}`);
      if (!response.ok) throw new Error("Failed to fetch files");

      const data = await response.json();
      setState((prev) => ({
        ...prev,
        files: data.files,
        currentFolderId: targetFolderId,
      }));
    } catch (error) {
      console.error("Failed to fetch Google Drive files:", error);
      notify("Failed to fetch files");
    }
  }, [notify]);

  const fetchFileContent = useCallback(async (fileId: string): Promise<FileContent | null> => {
    try {
      const response = await fetch("/api/google-drive/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error("Failed to fetch file content");

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch file content:", error);
      notify("Failed to fetch file content");
      return null;
    }
  }, [notify]);

  const saveFile = useCallback(async (
    name: string,
    content: string,
    folderId?: string,
    fileId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/google-drive/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content,
          folderId: folderId || stateRef.current.currentFolderId,
          fileId,
        }),
      });

      if (!response.ok) throw new Error("Failed to save file");

      notify("File saved to Google Drive");
      return true;
    } catch (error) {
      console.error("Failed to save to Google Drive:", error);
      notify("Failed to save file");
      return false;
    }
  }, [notify]);

  const navigateToFolder = useCallback((folderId: string) => {
    setState((prev) => ({
      ...prev,
      pathHistory: [...prev.pathHistory, prev.currentFolderId],
    }));
    fetchFiles(folderId);
  }, [fetchFiles]);

  const navigateBack = useCallback(() => {
    const { pathHistory } = stateRef.current;
    if (pathHistory.length === 0) return;

    const newHistory = [...pathHistory];
    const previousFolderId = newHistory.pop() || "root";

    setState((prev) => ({
      ...prev,
      pathHistory: newHistory,
    }));
    fetchFiles(previousFolderId);
  }, [fetchFiles]);

  return {
    isConnected: state.isConnected,
    files: state.files,
    currentFolderId: state.currentFolderId,
    pathHistory: state.pathHistory,
    connect,
    disconnect,
    fetchFiles,
    fetchFileContent,
    saveFile,
    navigateToFolder,
    navigateBack,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add hooks/useGoogleDrive.ts
git commit -m "feat: add useGoogleDrive hook"
```

---

### Task 9: Create GoogleDriveModal Component

**Files:**
- Create: `components/modals/GoogleDriveModal.tsx`

**Step 1: Create the modal (copy pattern from DropboxModal)**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  HardDrive,
  ArrowLeft,
  Folder,
  FileText,
  Save,
} from "lucide-react";

type Mode = "import" | "save";

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: Mode;
}

export function GoogleDriveModal({ isOpen, onClose, mode }: GoogleDriveModalProps) {
  const googleDrive = useGoogleDrive();
  const { notify } = useToast();
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [newFileName, setNewFileName] = useState("");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && googleDrive.isConnected) {
      googleDrive.fetchFiles("root");
      setNewFileName(currentDocument?.title || "document");
      setSelectedFileId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, googleDrive.isConnected]);

  if (!isOpen) return null;

  const handleItemClick = async (item: { id: string; name: string; isFolder: boolean }) => {
    if (item.isFolder) {
      googleDrive.navigateToFolder(item.id);
    } else if (mode === "import") {
      const file = await googleDrive.fetchFileContent(item.id);
      if (file) {
        updateDocumentBody(file.content);
        updateDocumentTitle(file.name.replace(/\.md$/, ""));
        notify("File imported from Google Drive");
        onClose();
      }
    } else {
      // Save mode - select file to overwrite
      setSelectedFileId(item.id);
      setNewFileName(item.name.replace(/\.md$/, ""));
    }
  };

  const handleSave = async () => {
    if (!currentDocument) return;

    const fileName = newFileName.endsWith(".md") ? newFileName : `${newFileName}.md`;
    const success = await googleDrive.saveFile(
      fileName,
      currentDocument.body,
      googleDrive.currentFolderId !== "root" ? googleDrive.currentFolderId : undefined,
      selectedFileId || undefined
    );

    if (success) {
      onClose();
    }
  };

  // Not connected state
  if (!googleDrive.isConnected) {
    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="google-drive-connect-title"
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-md p-6">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <HardDrive size={48} className="mx-auto text-text-invert mb-4" aria-hidden="true" />
            <h2 id="google-drive-connect-title" className="text-xl font-semibold text-text-invert mb-2 text-balance">
              Connect to Google Drive
            </h2>
            <p className="text-text-muted mb-6">
              Connect your Google Drive account to import and save markdown files.
            </p>
            <button
              onClick={googleDrive.connect}
              className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium
                         hover:opacity-90 transition-opacity
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              Connect Google Drive
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-drive-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-bg-navbar rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <div className="flex items-center gap-2">
            {googleDrive.pathHistory.length > 0 && (
              <button
                onClick={googleDrive.navigateBack}
                aria-label="Go back"
                className="text-text-invert hover:text-plum rounded
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <HardDrive size={24} className="text-text-invert" aria-hidden="true" />
            <h2 id="google-drive-modal-title" className="text-lg font-semibold text-text-invert text-balance">
              {mode === "import" ? "Import from Google Drive" : "Save to Google Drive"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-text-invert hover:text-plum rounded
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {mode === "save" && (
            <div className="mb-4 p-3 bg-bg-highlight rounded">
              <label htmlFor="google-drive-filename" className="block text-sm text-text-muted mb-1">
                File name
              </label>
              <input
                id="google-drive-filename"
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="document.md"
                className="w-full bg-bg-navbar text-text-invert px-3 py-2 rounded
                           border border-border-settings
                           focus:border-plum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
              />
            </div>
          )}

          {googleDrive.files.length === 0 ? (
            <p className="text-text-muted text-center py-4">
              No files found
            </p>
          ) : (
            <div className="space-y-1">
              {googleDrive.files.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-2 rounded text-text-invert
                             hover:bg-bg-highlight flex items-center gap-2
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum
                             ${selectedFileId === item.id ? "bg-bg-highlight" : ""}`}
                >
                  {item.isFolder ? (
                    <Folder size={16} className="text-text-muted" aria-hidden="true" />
                  ) : (
                    <FileText size={16} className="text-text-muted" aria-hidden="true" />
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
                         hover:opacity-90 transition-opacity flex items-center justify-center gap-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg-navbar"
            >
              <Save size={18} />
              Save to Google Drive
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/modals/GoogleDriveModal.tsx
git commit -m "feat: add GoogleDriveModal component"
```

---

### Task 10: Integrate Google Drive into Sidebar

**Files:**
- Modify: `components/sidebar/Sidebar.tsx`

**Step 1: Add imports and state**

Add to imports at top of file:
```typescript
import { useGoogleDrive } from "@/hooks/useGoogleDrive";
import { GoogleDriveModal } from "@/components/modals/GoogleDriveModal";
import { HardDrive } from "lucide-react";
```

**Step 2: Add hook and modal state inside Sidebar component**

After existing hook calls:
```typescript
const googleDrive = useGoogleDrive();

const [googleDriveModal, setGoogleDriveModal] = useState<{ open: boolean; mode: "import" | "save" }>({
  open: false,
  mode: "import",
});
```

**Step 3: Add Google Drive to Services section**

In the Services section (inside `{servicesOpen && ...}`), add after Dropbox ServiceButton:
```typescript
<ServiceButton
  icon={<HardDrive size={16} />}
  label="Google Drive"
  connected={googleDrive.isConnected}
  onConnect={googleDrive.connect}
  onDisconnect={googleDrive.disconnect}
/>
```

**Step 4: Add Google Drive to Import section**

In the Import section (inside `{importOpen && ...}`), add:
```typescript
<button
  onClick={() => setGoogleDriveModal({ open: true, mode: "import" })}
  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
>
  <HardDrive size={16} />
  <span>Google Drive</span>
</button>
```

**Step 5: Add Google Drive to Save section**

In the Save section (inside `{saveOpen && ...}`), add:
```typescript
<button
  onClick={() => setGoogleDriveModal({ open: true, mode: "save" })}
  className="w-full flex items-center gap-2 py-2 px-2 text-dropdown-link hover:text-text-invert text-sm rounded hover:bg-bg-highlight
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
>
  <HardDrive size={16} />
  <span>Google Drive</span>
</button>
```

**Step 6: Add modal to render**

After existing modals (before closing `</>`):
```typescript
<GoogleDriveModal
  isOpen={googleDriveModal.open}
  onClose={() => setGoogleDriveModal({ ...googleDriveModal, open: false })}
  mode={googleDriveModal.mode}
/>
```

**Step 7: Verify TypeScript compiles and lint passes**

Run: `npx tsc --noEmit && npm run lint`
Expected: No errors

**Step 8: Commit**

```bash
git add components/sidebar/Sidebar.tsx
git commit -m "feat: integrate Google Drive into sidebar"
```

---

## Part 2: Editor UX (Zen Mode & Scroll Sync)

### Task 11: Add Zen Mode and Scroll Sync to Store

**Files:**
- Modify: `stores/store.ts`

**Step 1: Add zen mode state**

Add to the AppState interface:
```typescript
zenMode: boolean;
setZenMode: (enabled: boolean) => void;
```

Add to Settings interface (if not already there, add scrollSync):
```typescript
scrollSync: boolean;
```

**Step 2: Add to initial state and actions**

In the create function, add to initial state:
```typescript
zenMode: false,
```

Add to settings default:
```typescript
scrollSync: true,
```

Add action:
```typescript
setZenMode: (enabled) => set({ zenMode: enabled }),
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add stores/store.ts
git commit -m "feat: add zenMode and scrollSync to store"
```

---

### Task 12: Implement Zen Mode in EditorContainer

**Files:**
- Modify: `components/editor/EditorContainer.tsx`

**Step 1: Add zen mode imports and state**

Add to imports:
```typescript
import { X, Maximize2 } from "lucide-react";
```

In EditorContent, add:
```typescript
const zenMode = useStore((state) => state.zenMode);
const setZenMode = useStore((state) => state.setZenMode);
```

**Step 2: Add keyboard shortcut effect**

Add useEffect for keyboard shortcut:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + Shift + Z for zen mode
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
      e.preventDefault();
      setZenMode(!zenMode);
    }
    // Escape to exit zen mode
    if (e.key === "Escape" && zenMode) {
      setZenMode(false);
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [zenMode, setZenMode]);
```

**Step 3: Add zen mode render**

Before the main return, add:
```typescript
if (zenMode) {
  return (
    <div className="h-dvh bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-3xl h-full py-12 px-4 relative">
        <button
          onClick={() => setZenMode(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-text-invert transition-colors rounded
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
          aria-label="Exit zen mode"
        >
          <X size={24} />
        </button>
        <div className="h-full border border-border-light rounded-lg overflow-hidden">
          <MonacoEditor />
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add components/editor/EditorContainer.tsx
git commit -m "feat: implement zen mode in editor"
```

---

### Task 13: Add Zen Mode Button to Navbar

**Files:**
- Modify: `components/navbar/Navbar.tsx`

**Step 1: Add imports**

Add to imports:
```typescript
import { Maximize2 } from "lucide-react";
```

**Step 2: Add zen mode state**

Add to component:
```typescript
const setZenMode = useStore((state) => state.setZenMode);
```

**Step 3: Add zen mode button**

Add button in the navbar (before settings button):
```typescript
<button
  onClick={() => setZenMode(true)}
  aria-label="Enter zen mode"
  className="text-icon-default hover:text-plum transition-colors rounded
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum"
>
  <Maximize2 size={20} />
</button>
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add components/navbar/Navbar.tsx
git commit -m "feat: add zen mode button to navbar"
```

---

### Task 14: Implement Scroll Sync

**Files:**
- Modify: `components/editor/MonacoEditor.tsx`
- Modify: `components/preview/MarkdownPreview.tsx`
- Modify: `stores/store.ts` (add scroll position)

**Step 1: Add scroll position to store**

In stores/store.ts, add to AppState:
```typescript
editorScrollPercent: number;
setEditorScrollPercent: (percent: number) => void;
```

Add initial state:
```typescript
editorScrollPercent: 0,
```

Add action:
```typescript
setEditorScrollPercent: (percent) => set({ editorScrollPercent: percent }),
```

**Step 2: Update MonacoEditor to emit scroll position**

In MonacoEditor.tsx, add to imports:
```typescript
import { useStore } from "@/stores/store";
```

Add state:
```typescript
const settings = useStore((state) => state.settings);
const setEditorScrollPercent = useStore((state) => state.setEditorScrollPercent);
```

In handleEditorDidMount, add scroll listener:
```typescript
editor.onDidScrollChange((e) => {
  if (settings.scrollSync) {
    const scrollTop = e.scrollTop;
    const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
    const percent = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    setEditorScrollPercent(percent);
  }
});
```

**Step 3: Update MarkdownPreview to sync scroll**

In MarkdownPreview.tsx, add:
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const settings = useStore((state) => state.settings);
const editorScrollPercent = useStore((state) => state.editorScrollPercent);
```

Add useEffect for scroll sync:
```typescript
useEffect(() => {
  if (!settings.scrollSync || !containerRef.current) return;

  const container = containerRef.current;
  const scrollHeight = container.scrollHeight - container.clientHeight;
  container.scrollTop = scrollHeight * editorScrollPercent;
}, [editorScrollPercent, settings.scrollSync]);
```

Add ref to container div:
```typescript
<div ref={containerRef} className="...existing classes...">
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add stores/store.ts components/editor/MonacoEditor.tsx components/preview/MarkdownPreview.tsx
git commit -m "feat: implement scroll sync between editor and preview"
```

---

### Task 15: Add Scroll Sync Toggle to Settings

**Files:**
- Modify: `components/modals/SettingsModal.tsx`

**Step 1: Add scroll sync toggle**

Add after existing toggles:
```typescript
{/* Scroll Sync */}
<SettingToggle
  id="scroll-sync"
  label="Scroll Sync"
  checked={settings.scrollSync}
  onChange={(v) => updateSettings({ scrollSync: v })}
/>
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add components/modals/SettingsModal.tsx
git commit -m "feat: add scroll sync toggle to settings"
```

---

## Part 3: Remaining Integrations

### Task 16: Create OneDrive Integration (Following Google Drive Pattern)

**Files:**
- Create: `app/api/onedrive/oauth/route.ts`
- Create: `app/api/onedrive/callback/route.ts`
- Create: `app/api/onedrive/status/route.ts`
- Create: `app/api/onedrive/unlink/route.ts`
- Create: `app/api/onedrive/files/route.ts`
- Create: `app/api/onedrive/save/route.ts`
- Create: `hooks/useOneDrive.ts`
- Create: `components/modals/OneDriveModal.tsx`
- Modify: `components/sidebar/Sidebar.tsx`

Follow the exact same pattern as Google Drive, replacing:
- API endpoints: Microsoft Graph API (`graph.microsoft.com`)
- OAuth URL: `login.microsoftonline.com`
- Scopes: `Files.ReadWrite`
- Cookie name: `onedrive_token`
- Icon: Use `CloudCog` from lucide-react

**Commit after each major piece:**
```bash
git commit -m "feat: add OneDrive OAuth routes"
git commit -m "feat: add OneDrive files and save routes"
git commit -m "feat: add useOneDrive hook"
git commit -m "feat: add OneDriveModal component"
git commit -m "feat: integrate OneDrive into sidebar"
```

---

### Task 17: Create Bitbucket Integration (Following GitHub Pattern)

**Files:**
- Create: `app/api/bitbucket/oauth/route.ts`
- Create: `app/api/bitbucket/callback/route.ts`
- Create: `app/api/bitbucket/status/route.ts`
- Create: `app/api/bitbucket/unlink/route.ts`
- Create: `app/api/bitbucket/workspaces/route.ts`
- Create: `app/api/bitbucket/repos/route.ts`
- Create: `app/api/bitbucket/branches/route.ts`
- Create: `app/api/bitbucket/files/route.ts`
- Create: `app/api/bitbucket/save/route.ts`
- Create: `hooks/useBitbucket.ts`
- Create: `components/modals/BitbucketModal.tsx`
- Modify: `components/sidebar/Sidebar.tsx`

Follow GitHub pattern with Bitbucket API:
- OAuth URL: `bitbucket.org/site/oauth2`
- API: `api.bitbucket.org/2.0`
- Uses "workspaces" instead of "orgs"

**Commit after each major piece.**

---

### Task 18: Create Medium Integration (Publish Only)

**Files:**
- Create: `app/api/medium/oauth/route.ts`
- Create: `app/api/medium/callback/route.ts`
- Create: `app/api/medium/status/route.ts`
- Create: `app/api/medium/unlink/route.ts`
- Create: `app/api/medium/publish/route.ts`
- Create: `hooks/useMedium.ts`
- Create: `components/modals/MediumPublishModal.tsx`
- Modify: `components/navbar/Navbar.tsx` (add to export dropdown)
- Modify: `components/sidebar/Sidebar.tsx` (add to services)

Simpler pattern - publish only:
- OAuth via Medium API
- Publish creates draft post
- No file browsing needed

**Commit after each major piece.**

---

## Part 4: File Handling

### Task 19: Implement Drag & Drop Import

**Files:**
- Modify: `components/editor/EditorContainer.tsx`

**Step 1: Add drag and drop state and handlers**

Add state:
```typescript
const [isDragging, setIsDragging] = useState(false);
```

Add to store usage:
```typescript
const createDocument = useStore((state) => state.createDocument);
const updateDocumentBody = useStore((state) => state.updateDocumentBody);
const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);
```

Add handlers:
```typescript
const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  if (e.currentTarget === e.target) {
    setIsDragging(false);
  }
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (file && /\.(md|markdown|txt)$/i.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      createDocument();
      updateDocumentTitle(file.name.replace(/\.(md|markdown|txt)$/i, ""));
      updateDocumentBody(reader.result as string);
      notify("File imported");
    };
    reader.readAsText(file);
  }
};
```

**Step 2: Add drag overlay to render**

Wrap the main content div and add overlay:
```typescript
<div
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  className="h-dvh flex overflow-hidden relative"
>
  {isDragging && (
    <div className="absolute inset-0 z-overlay bg-plum/20 flex items-center justify-center pointer-events-none">
      <div className="bg-bg-navbar text-text-invert px-6 py-4 rounded-lg shadow-lg">
        Drop file to import
      </div>
    </div>
  )}
  {/* ...existing content... */}
</div>
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add components/editor/EditorContainer.tsx
git commit -m "feat: implement drag and drop file import"
```

---

### Task 20: Implement Image Upload

**Files:**
- Create: `app/api/google-drive/upload-image/route.ts`
- Create: `app/api/dropbox/upload-image/route.ts`
- Create: `components/modals/ImageUploadModal.tsx`
- Modify: `components/editor/MonacoEditor.tsx`

**Step 1: Create image upload API route for Google Drive**

```typescript
// app/api/google-drive/upload-image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("google_drive_token");

  if (!tokenCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const tokens = JSON.parse(tokenCookie.value);
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Upload to Google Drive and get shareable link
  // ... implementation

  return NextResponse.json({ url: shareableUrl });
}
```

**Step 2: Create ImageUploadModal**

Modal that shows when user pastes an image, lets them select which service to upload to.

**Step 3: Add paste handler to MonacoEditor**

Detect image paste, show modal, insert markdown link.

**Step 4: Verify and commit**

```bash
git add app/api/google-drive/upload-image/route.ts app/api/dropbox/upload-image/route.ts
git add components/modals/ImageUploadModal.tsx components/editor/MonacoEditor.tsx
git commit -m "feat: implement image upload to cloud services"
```

---

## Final Task: Verification

### Task 21: Final Verification

**Step 1: Run full verification**

```bash
npx tsc --noEmit && npm run lint
```
Expected: No errors

**Step 2: Start dev server and test**

```bash
npm run dev
```

Test checklist:
- [ ] Google Drive: connect, browse, import, save
- [ ] Zen mode: activate with Cmd+Shift+Z, exit with Escape
- [ ] Scroll sync: editor scroll moves preview
- [ ] Drag & drop: drop .md file imports it
- [ ] OneDrive: connect, browse, import, save
- [ ] Bitbucket: connect, navigate repos, import, save
- [ ] Medium: connect, publish document
- [ ] Image upload: paste image, select service, inserts link

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 3 implementation"
```

---

## Summary

Phase 3 adds:
- 4 new cloud integrations (Google Drive, OneDrive, Bitbucket, Medium)
- Zen mode for distraction-free writing
- Scroll sync between editor and preview
- Drag & drop file import
- Image upload to cloud services

Total new files: ~25
Modified files: ~10
Estimated tasks: 21
