# Phase 3: Complete Feature Parity - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Date:** 2026-01-19
**Status:** Approved
**Goal:** Complete the Dillinger Next.js migration with all deferred features

---

## Overview

Phase 3 delivers full functional parity with the Angular.js original by implementing:

1. **Google Drive integration** - OAuth, browse folders, import/save .md files
2. **OneDrive integration** - Same pattern as Google Drive
3. **Medium integration** - Publish documents to Medium as drafts
4. **Bitbucket integration** - Same pattern as GitHub
5. **Zen mode** - Editor-only fullscreen for distraction-free writing
6. **Scroll sync** - Preview follows editor scroll position (on by default)
7. **File handling** - Drag & drop .md import, image upload to cloud

**Implementation order:**
1. Google Drive (establishes patterns for other cloud services)
2. Editor UX (Zen mode, scroll sync)
3. OneDrive, Bitbucket, Medium
4. File handling (drag & drop, image upload)

---

## 1. Google Drive Integration

### OAuth Flow

- Register app in Google Cloud Console with Drive API enabled
- Scopes: `https://www.googleapis.com/auth/drive.file`
- Redirect URI: `/api/google-drive/callback`
- Token storage: HTTP-only cookies (matches Dropbox/GitHub pattern)

### API Routes

```
/api/google-drive/
├── oauth/route.ts      # Initiates OAuth, redirects to Google
├── callback/route.ts   # Exchanges code for tokens, sets cookie
├── status/route.ts     # Returns connection status
├── files/route.ts      # GET: list folders/files, POST: get file content
├── save/route.ts       # POST: create or update file
└── unlink/route.ts     # POST: clear tokens, disconnect
```

### Implementation

Direct REST API calls (no SDK) to avoid Next.js server compatibility issues.

### Hook Interface

```typescript
interface UseGoogleDrive {
  isConnected: boolean;
  files: DriveFile[];
  currentPath: string;
  pathHistory: string[];
  connect: () => void;
  disconnect: () => void;
  fetchFiles: (folderId?: string) => Promise<void>;
  fetchFileContent: (fileId: string) => Promise<FileContent | null>;
  saveFile: (name: string, content: string, folderId?: string) => Promise<boolean>;
  navigateToFolder: (folderId: string) => void;
  navigateBack: () => void;
}
```

### Modal UI

Reuse DropboxModal structure:
- Folder browser with back navigation
- File list (folders and .md files)
- Save mode: filename input field
- Consistent styling with existing modals

---

## 2. Editor UX

### Zen Mode

**State:** `zenMode: boolean` in Zustand store (not persisted)

**Activation:**
- Keyboard shortcut: `Cmd/Ctrl + Shift + Z`
- Navbar button with expand icon

**Behavior:**
- Hides: sidebar, navbar, document title bar, preview panel
- Shows: Monaco editor centered, max-width 800px
- Exit: `Escape` key or × button in corner

**Implementation:**
```typescript
// EditorContainer.tsx
if (zenMode) {
  return (
    <div className="h-dvh bg-bg-primary flex items-center justify-center">
      <div className="w-full max-w-3xl h-full py-12 px-4 relative">
        <button
          onClick={() => setZenMode(false)}
          className="absolute top-4 right-4 text-text-muted hover:text-text-invert"
          aria-label="Exit zen mode"
        >
          <X size={20} />
        </button>
        <MonacoEditor className="h-full" />
      </div>
    </div>
  );
}
```

### Scroll Sync

**State:** `scrollSync: boolean` in settings (persisted, default `true`)

**Behavior:**
- Editor scroll position syncs to preview proportionally
- Formula: `(editorScrollTop / editorScrollHeight) * previewScrollHeight`
- Debounced at 50ms to prevent jank

**Implementation:**
- Monaco `onDidScrollChange` event triggers sync
- Preview container ref receives calculated scroll position
- Settings toggle to disable

---

## 3. OneDrive Integration

Follows Google Drive pattern exactly:

- OAuth via Microsoft Identity Platform
- Scopes: `Files.ReadWrite`
- API routes: `/api/onedrive/{oauth,callback,status,files,save,unlink}`
- Hook: `useOneDrive()` with identical interface
- Modal: Same folder browser UI pattern

---

## 4. Bitbucket Integration

Follows GitHub pattern:

- OAuth via Atlassian/Bitbucket
- Multi-step navigation: Workspaces → Repos → Branches → Files
- API routes: `/api/bitbucket/{oauth,callback,status,workspaces,repos,branches,files,save,unlink}`
- Hook: `useBitbucket()` mirrors `useGitHub()` interface
- Modal: Same multi-step UI as GitHubModal

---

## 5. Medium Integration

Different pattern - publish only:

- OAuth via Medium API
- Single action: "Publish to Medium" in export dropdown
- Creates draft post (user publishes on Medium)
- API routes: `/api/medium/{oauth,callback,status,publish,unlink}`

**Hook interface:**
```typescript
interface UseMedium {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  publish: (title: string, content: string, tags?: string[]) => Promise<boolean>;
}
```

**Modal:** Simple form with title, tags input, publish button.

---

## 6. File Handling

### Drag & Drop Import

**Behavior:**
- Drop zone covers entire editor area
- Accepts: `.md`, `.markdown`, `.txt` files
- Creates new document with file content and filename as title
- Visual feedback: overlay on drag enter

**Implementation:**
```typescript
const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer.files[0];
  if (file && /\.(md|markdown|txt)$/i.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      createDocument();
      updateDocumentTitle(file.name.replace(/\.(md|markdown|txt)$/i, ''));
      updateDocumentBody(reader.result as string);
    };
    reader.readAsText(file);
  }
};
```

### Image Upload

**Behavior:**
- Paste or drag image into editor
- Modal: "Upload to [service]?" with service selector
- Uploads to selected cloud service
- Inserts markdown: `![image](url)` at cursor

**Requirements:**
- At least one cloud service must be connected
- API route per service: `/api/[service]/upload-image`
- Returns shareable URL

**Fallback:** If no service connected, show message prompting user to connect one.

---

## Store Updates

```typescript
interface AppState {
  // Existing...

  // Phase 3 additions
  zenMode: boolean;
  setZenMode: (enabled: boolean) => void;
}

interface Settings {
  // Existing...

  // Phase 3 additions
  scrollSync: boolean;  // default: true
}
```

---

## UI Updates

### Sidebar Services Section

Add to existing services list:
- Google Drive (with connect/unlink)
- OneDrive (with connect/unlink)
- Medium (with connect/unlink)
- Bitbucket (with connect/unlink)

### Sidebar Import/Save Sections

Add entries for each new service in "Import from" and "Save to" sections.

### Navbar

- Add Zen mode toggle button (expand icon)
- Add "Publish to Medium" in export dropdown (when connected)

### Settings Modal

- Add "Scroll Sync" toggle (default on)

---

## Environment Variables

```env
# Google Drive
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OneDrive
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=

# Medium
MEDIUM_CLIENT_ID=
MEDIUM_CLIENT_SECRET=

# Bitbucket
BITBUCKET_CLIENT_ID=
BITBUCKET_CLIENT_SECRET=
```

---

## Success Criteria

- [ ] All four cloud services authenticate and sync files
- [ ] Zen mode hides all UI, Escape exits
- [ ] Scroll sync works smoothly, can be disabled
- [ ] Drag & drop imports .md files correctly
- [ ] Image upload works with connected services
- [ ] All features accessible via keyboard
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
