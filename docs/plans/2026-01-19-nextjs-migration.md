# Dillinger Next.js Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Dillinger from Angular.js to Next.js 14 with App Router, maintaining 100% functional parity.

**Architecture:** Single-page editor app with Zustand state management, Monaco Editor, markdown-it rendering, and Next.js API routes for exports and OAuth. All state persisted to localStorage.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Zustand, Monaco Editor, markdown-it, Lucide React

---

## Phase 1: Project Setup

### Task 1.1: Initialize Next.js Project

**Files:**
- Create: `next-app/` (new Next.js project)
- Create: `next-app/package.json`
- Create: `next-app/tsconfig.json`
- Create: `next-app/tailwind.config.ts`

**Step 1: Create Next.js app with TypeScript and Tailwind**

```bash
cd /Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration
npx create-next-app@latest next-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

**Step 2: Verify project created**

```bash
ls next-app/
```
Expected: `app/`, `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`

**Step 3: Commit**

```bash
cd next-app && git add -A && git commit -m "feat: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

### Task 1.2: Install Core Dependencies

**Files:**
- Modify: `next-app/package.json`

**Step 1: Install editor and state management**

```bash
cd /Users/joemccann/dev/vercel/dillinger/.worktrees/nextjs-migration/next-app
npm install @monaco-editor/react zustand lucide-react
```

**Step 2: Install markdown rendering stack**

```bash
npm install markdown-it markdown-it-abbr markdown-it-checkbox markdown-it-deflist markdown-it-footnote markdown-it-ins markdown-it-mark markdown-it-sub markdown-it-sup markdown-it-toc-done-right highlight.js katex
```

**Step 3: Install types**

```bash
npm install -D @types/markdown-it
```

**Step 4: Verify installation**

```bash
npm ls @monaco-editor/react zustand markdown-it
```
Expected: All packages listed without errors

**Step 5: Commit**

```bash
git add package.json package-lock.json && git commit -m "feat: add core dependencies (Monaco, Zustand, markdown-it)"
```

---

### Task 1.3: Configure Tailwind with Design Tokens

**Files:**
- Modify: `next-app/tailwind.config.ts`

**Step 1: Update Tailwind config with Dillinger design tokens**

Replace contents of `next-app/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        plum: "#35D7BB",
        "bg-primary": "#ffffff",
        "bg-sidebar": "#2B2F36",
        "bg-navbar": "#373D49",
        "bg-highlight": "#1D212A",
        "bg-button-save": "#4A5261",
        "text-primary": "#373D49",
        "text-invert": "#ffffff",
        "text-muted": "#A0AABF",
        "border-light": "#E8E8E8",
        "border-settings": "#4F535B",
        "icon-default": "#D3DAEA",
        "dropdown-link": "#D0D6E2",
        switchery: "#4B5363",
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
        mono: ['"Ubuntu Mono"', "Monaco", "monospace"],
      },
      spacing: {
        sidebar: "270px",
        gutter: "32px",
      },
      zIndex: {
        sidebar: "1",
        page: "2",
        editor: "3",
        preview: "4",
        overlay: "5",
        navbar: "6",
        settings: "7",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Add Google Fonts to layout**

Update `next-app/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Dillinger - Online Markdown Editor",
  description: "The last Markdown editor you'll ever need",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans`}>{children}</body>
    </html>
  );
}
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: Build succeeds

**Step 4: Commit**

```bash
git add tailwind.config.ts app/layout.tsx && git commit -m "feat: configure Tailwind with Dillinger design tokens"
```

---

## Phase 2: State Management

### Task 2.1: Create Zustand Store Types

**Files:**
- Create: `next-app/lib/types.ts`

**Step 1: Create types file**

Create `next-app/lib/types.ts`:

```typescript
export interface Document {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  github?: {
    sha: string;
    path: string;
    repo: string;
    owner: string;
    branch: string;
  };
}

export interface UserSettings {
  enableAutoSave: boolean;
  enableWordsCount: boolean;
  enableCharactersCount: boolean;
  enableScrollSync: boolean;
  tabSize: number;
  keybindings: "default" | "vim" | "emacs";
  enableNightMode: boolean;
  enableGitHubComment: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  enableAutoSave: true,
  enableWordsCount: true,
  enableCharactersCount: true,
  enableScrollSync: false,
  tabSize: 4,
  keybindings: "default",
  enableNightMode: false,
  enableGitHubComment: true,
};

export const DEFAULT_DOCUMENT_BODY = `# Welcome to Dillinger

Dillinger is a cloud-enabled, mobile-ready, offline-storage compatible,
AngularJS-powered HTML5 Markdown editor.

- Type some Markdown on the left
- See HTML in the right
- Magic

## Features

- Import a HTML file and watch it magically convert to Markdown
- Drag and drop images (requires your Dropbox account be linked)
- Import and save files from GitHub, Dropbox, Google Drive and One Drive
- Drag and drop markdown and HTML files into Dillinger
- Export documents as Markdown, HTML and PDF
`;
```

**Step 2: Commit**

```bash
git add lib/types.ts && git commit -m "feat: add TypeScript types for documents and settings"
```

---

### Task 2.2: Create Zustand Store

**Files:**
- Create: `next-app/stores/store.ts`

**Step 1: Create store with persistence**

Create `next-app/stores/store.ts`:

```typescript
import { create } from "zustand";
import { Document, UserSettings, DEFAULT_SETTINGS, DEFAULT_DOCUMENT_BODY } from "@/lib/types";

interface AppState {
  // Documents
  documents: Document[];
  currentDocument: Document | null;

  // Settings
  settings: UserSettings;

  // UI State
  sidebarOpen: boolean;
  settingsOpen: boolean;
  previewVisible: boolean;

  // Document Actions
  createDocument: () => void;
  selectDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  updateDocumentBody: (body: string) => void;
  updateDocumentTitle: (title: string) => void;

  // Settings Actions
  updateSettings: (settings: Partial<UserSettings>) => void;

  // UI Actions
  toggleSidebar: () => void;
  toggleSettings: () => void;
  togglePreview: () => void;

  // Persistence
  hydrate: () => void;
  persist: () => void;
}

const createDefaultDocument = (): Document => ({
  id: Date.now().toString(),
  title: "Untitled Document",
  body: DEFAULT_DOCUMENT_BODY,
  createdAt: new Date().toISOString(),
});

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  documents: [],
  currentDocument: null,
  settings: DEFAULT_SETTINGS,
  sidebarOpen: true,
  settingsOpen: false,
  previewVisible: true,

  // Document Actions
  createDocument: () => {
    const newDoc = createDefaultDocument();
    set((state) => ({
      documents: [...state.documents, newDoc],
      currentDocument: newDoc,
    }));
    get().persist();
  },

  selectDocument: (id: string) => {
    const doc = get().documents.find((d) => d.id === id);
    if (doc) {
      set({ currentDocument: doc });
      get().persist();
    }
  },

  deleteDocument: (id: string) => {
    const { documents, currentDocument } = get();
    const filtered = documents.filter((d) => d.id !== id);

    let newCurrent = currentDocument;
    if (currentDocument?.id === id) {
      newCurrent = filtered[0] || null;
    }

    set({ documents: filtered, currentDocument: newCurrent });
    get().persist();
  },

  updateDocumentBody: (body: string) => {
    const { currentDocument, documents } = get();
    if (!currentDocument) return;

    const updated = { ...currentDocument, body };
    const updatedDocs = documents.map((d) =>
      d.id === currentDocument.id ? updated : d
    );

    set({ currentDocument: updated, documents: updatedDocs });
    // Note: persist is called by debounced auto-save, not here
  },

  updateDocumentTitle: (title: string) => {
    const { currentDocument, documents } = get();
    if (!currentDocument) return;

    const updated = { ...currentDocument, title };
    const updatedDocs = documents.map((d) =>
      d.id === currentDocument.id ? updated : d
    );

    set({ currentDocument: updated, documents: updatedDocs });
    get().persist();
  },

  // Settings Actions
  updateSettings: (newSettings: Partial<UserSettings>) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    get().persist();
  },

  // UI Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),
  togglePreview: () => set((state) => ({ previewVisible: !state.previewVisible })),

  // Persistence
  hydrate: () => {
    if (typeof window === "undefined") return;

    try {
      const filesJson = localStorage.getItem("files");
      const currentJson = localStorage.getItem("currentDocument");
      const settingsJson = localStorage.getItem("profileV3");

      let documents: Document[] = filesJson ? JSON.parse(filesJson) : [];
      let currentDocument: Document | null = currentJson ? JSON.parse(currentJson) : null;
      const settings: UserSettings = settingsJson
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) }
        : DEFAULT_SETTINGS;

      // Ensure at least one document exists
      if (documents.length === 0) {
        const defaultDoc = createDefaultDocument();
        documents = [defaultDoc];
        currentDocument = defaultDoc;
      }

      // Ensure currentDocument is valid
      if (!currentDocument || !documents.find((d) => d.id === currentDocument!.id)) {
        currentDocument = documents[0];
      }

      set({ documents, currentDocument, settings });
    } catch (e) {
      console.error("Failed to hydrate state:", e);
    }
  },

  persist: () => {
    if (typeof window === "undefined") return;

    const { documents, currentDocument, settings } = get();

    try {
      localStorage.setItem("files", JSON.stringify(documents));
      localStorage.setItem("currentDocument", JSON.stringify(currentDocument));
      localStorage.setItem("profileV3", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to persist state:", e);
    }
  },
}));
```

**Step 2: Commit**

```bash
git add stores/store.ts && git commit -m "feat: add Zustand store with document and settings management"
```

---

### Task 2.3: Create Store Provider

**Files:**
- Create: `next-app/components/providers/StoreProvider.tsx`

**Step 1: Create provider component**

Create directory and file `next-app/components/providers/StoreProvider.tsx`:

```typescript
"use client";

import { useEffect } from "react";
import { useStore } from "@/stores/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
```

**Step 2: Update layout to use provider**

Update `next-app/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Dillinger - Online Markdown Editor",
  description: "The last Markdown editor you'll ever need",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/providers/StoreProvider.tsx app/layout.tsx && git commit -m "feat: add StoreProvider for state hydration"
```

---

## Phase 3: Markdown Rendering

### Task 3.1: Create Markdown Library

**Files:**
- Create: `next-app/lib/markdown.ts`

**Step 1: Create markdown-it configuration**

Create `next-app/lib/markdown.ts`:

```typescript
import MarkdownIt from "markdown-it";
import markdownItAbbr from "markdown-it-abbr";
import markdownItCheckbox from "markdown-it-checkbox";
import markdownItDeflist from "markdown-it-deflist";
import markdownItFootnote from "markdown-it-footnote";
import markdownItIns from "markdown-it-ins";
import markdownItMark from "markdown-it-mark";
import markdownItSub from "markdown-it-sub";
import markdownItSup from "markdown-it-sup";
import hljs from "highlight.js";

export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
      } catch {
        // Fall through to default
      }
    }
    return ""; // Use external default escaping
  },
})
  .use(markdownItAbbr)
  .use(markdownItCheckbox)
  .use(markdownItDeflist)
  .use(markdownItFootnote)
  .use(markdownItIns)
  .use(markdownItMark)
  .use(markdownItSub)
  .use(markdownItSup);

export function renderMarkdown(content: string): string {
  return md.render(content);
}
```

**Step 2: Commit**

```bash
git add lib/markdown.ts && git commit -m "feat: add markdown-it configuration with all plugins"
```

---

### Task 3.2: Create Preview Component

**Files:**
- Create: `next-app/components/preview/MarkdownPreview.tsx`
- Modify: `next-app/app/globals.css`

**Step 1: Create preview component**

Create `next-app/components/preview/MarkdownPreview.tsx`:

```typescript
"use client";

import { useMemo } from "react";
import { useStore } from "@/stores/store";
import { renderMarkdown } from "@/lib/markdown";

export function MarkdownPreview() {
  const currentDocument = useStore((state) => state.currentDocument);

  const html = useMemo(() => {
    if (!currentDocument?.body) return "";
    return renderMarkdown(currentDocument.body);
  }, [currentDocument?.body]);

  return (
    <div
      id="preview"
      className="preview-html h-full overflow-auto p-6 bg-bg-primary"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

**Step 2: Add preview styles to globals.css**

Append to `next-app/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Preview Styles */
.preview-html {
  font-family: Georgia, Cambria, serif;
  font-size: 14px;
  line-height: 1.7;
  color: #373D49;
}

.preview-html h1,
.preview-html h2,
.preview-html h3,
.preview-html h4,
.preview-html h5,
.preview-html h6 {
  font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.preview-html h1 { font-size: 2em; }
.preview-html h2 { font-size: 1.5em; }
.preview-html h3 { font-size: 1.25em; }
.preview-html h4 { font-size: 1em; }

.preview-html p {
  margin-bottom: 1em;
}

.preview-html a {
  color: #35D7BB;
  text-decoration: none;
}

.preview-html a:hover {
  text-decoration: underline;
}

.preview-html code {
  font-family: "Ubuntu Mono", Monaco, monospace;
  background: #F5F7FA;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.preview-html pre {
  background: #F5F7FA;
  padding: 1em;
  border-radius: 3px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.preview-html pre code {
  background: none;
  padding: 0;
}

.preview-html blockquote {
  border-left: 3px solid #A0AABF;
  padding-left: 1em;
  margin-left: 0;
  font-style: italic;
  color: #666;
}

.preview-html ul,
.preview-html ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.preview-html li {
  margin-bottom: 0.25em;
}

.preview-html table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.preview-html th,
.preview-html td {
  border: 1px solid #E8E8E8;
  padding: 0.5em;
  text-align: left;
}

.preview-html th {
  background: #F5F7FA;
  font-weight: 600;
}

.preview-html img {
  max-width: 100%;
  height: auto;
}

.preview-html hr {
  border: none;
  border-top: 1px solid #E8E8E8;
  margin: 2em 0;
}

/* Highlight.js Solarized Dark */
@import "highlight.js/styles/solarized-dark.css";
```

**Step 3: Verify build**

```bash
npm run build
```
Expected: Build succeeds

**Step 4: Commit**

```bash
git add components/preview/MarkdownPreview.tsx app/globals.css && git commit -m "feat: add MarkdownPreview component with styling"
```

---

## Phase 4: Monaco Editor

### Task 4.1: Create Monaco Editor Component

**Files:**
- Create: `next-app/components/editor/MonacoEditor.tsx`

**Step 1: Create editor component**

Create `next-app/components/editor/MonacoEditor.tsx`:

```typescript
"use client";

import { useRef, useCallback } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import { useStore } from "@/stores/store";

export function MonacoEditor() {
  const editorRef = useRef<any>(null);
  const currentDocument = useStore((state) => state.currentDocument);
  const settings = useStore((state) => state.settings);
  const updateDocumentBody = useStore((state) => state.updateDocumentBody);
  const persist = useStore((state) => state.persist);

  // Debounced persist for auto-save
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleChange: OnChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;

      updateDocumentBody(value);

      // Debounced auto-save
      if (settings.enableAutoSave) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          persist();
        }, 2000);
      }
    },
    [updateDocumentBody, persist, settings.enableAutoSave]
  );

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-primary text-text-muted">
        No document selected
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language="markdown"
      theme={settings.enableNightMode ? "vs-dark" : "vs"}
      value={currentDocument.body}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        fontSize: 14,
        fontFamily: '"Ubuntu Mono", Monaco, monospace',
        lineHeight: 24,
        wordWrap: "on",
        minimap: { enabled: false },
        lineNumbers: "off",
        folding: false,
        tabSize: settings.tabSize,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          vertical: "auto",
          horizontal: "auto",
        },
      }}
    />
  );
}
```

**Step 2: Commit**

```bash
git add components/editor/MonacoEditor.tsx && git commit -m "feat: add Monaco Editor component with auto-save"
```

---

## Phase 5: UI Components

### Task 5.1: Create Toast Notification System

**Files:**
- Create: `next-app/components/ui/Toast.tsx`

**Step 1: Create toast component and context**

Create `next-app/components/ui/Toast.tsx`:

```typescript
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
}

interface ToastContextType {
  notify: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-bg-navbar text-text-invert px-4 py-3 rounded shadow-lg
                       flex items-center gap-3 animate-in slide-in-from-right"
          >
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="hover:opacity-70 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
```

**Step 2: Add animation to Tailwind config**

Update `next-app/tailwind.config.ts` to add animation:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        plum: "#35D7BB",
        "bg-primary": "#ffffff",
        "bg-sidebar": "#2B2F36",
        "bg-navbar": "#373D49",
        "bg-highlight": "#1D212A",
        "bg-button-save": "#4A5261",
        "text-primary": "#373D49",
        "text-invert": "#ffffff",
        "text-muted": "#A0AABF",
        "border-light": "#E8E8E8",
        "border-settings": "#4F535B",
        "icon-default": "#D3DAEA",
        "dropdown-link": "#D0D6E2",
        switchery: "#4B5363",
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
        mono: ['"Ubuntu Mono"', "Monaco", "monospace"],
      },
      spacing: {
        sidebar: "270px",
        gutter: "32px",
      },
      zIndex: {
        sidebar: "1",
        page: "2",
        editor: "3",
        preview: "4",
        overlay: "5",
        navbar: "6",
        settings: "7",
      },
      keyframes: {
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "in": "slide-in-from-right 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 3: Add ToastProvider to layout**

Update `next-app/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Dillinger - Online Markdown Editor",
  description: "The last Markdown editor you'll ever need",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sourceSans.variable} font-sans`}>
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
```

**Step 4: Commit**

```bash
git add components/ui/Toast.tsx tailwind.config.ts app/layout.tsx && git commit -m "feat: add Toast notification system"
```

---

### Task 5.2: Create Sidebar Component

**Files:**
- Create: `next-app/components/sidebar/Sidebar.tsx`
- Create: `next-app/components/sidebar/DocumentList.tsx`

**Step 1: Create DocumentList component**

Create `next-app/components/sidebar/DocumentList.tsx`:

```typescript
"use client";

import { useStore } from "@/stores/store";
import { FileText } from "lucide-react";

export function DocumentList() {
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const selectDocument = useStore((state) => state.selectDocument);

  return (
    <ul className="space-y-1">
      {documents.map((doc) => (
        <li key={doc.id}>
          <button
            onClick={() => selectDocument(doc.id)}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 text-sm transition-colors ${
              currentDocument?.id === doc.id
                ? "bg-bg-highlight text-text-invert"
                : "text-dropdown-link hover:bg-bg-highlight/50"
            }`}
          >
            <FileText size={16} />
            <span className="truncate">{doc.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**Step 2: Create Sidebar component**

Create `next-app/components/sidebar/Sidebar.tsx`:

```typescript
"use client";

import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import { DocumentList } from "./DocumentList";
import { Plus, Save, Trash2 } from "lucide-react";

export function Sidebar() {
  const sidebarOpen = useStore((state) => state.sidebarOpen);
  const documents = useStore((state) => state.documents);
  const currentDocument = useStore((state) => state.currentDocument);
  const createDocument = useStore((state) => state.createDocument);
  const deleteDocument = useStore((state) => state.deleteDocument);
  const persist = useStore((state) => state.persist);
  const { notify } = useToast();

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
    <aside className="w-sidebar bg-bg-sidebar h-screen flex flex-col z-sidebar">
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-plum">DILLINGER</h1>
      </div>

      {/* Documents Section */}
      <div className="flex-1 overflow-auto px-4">
        <h2 className="text-xs uppercase tracking-wider text-text-muted mb-2">
          Documents
        </h2>
        <DocumentList />
      </div>

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
  );
}
```

**Step 3: Commit**

```bash
git add components/sidebar/ && git commit -m "feat: add Sidebar with document list and actions"
```

---

### Task 5.3: Create Navbar Component

**Files:**
- Create: `next-app/components/navbar/Navbar.tsx`

**Step 1: Create navbar component**

Create `next-app/components/navbar/Navbar.tsx`:

```typescript
"use client";

import { useStore } from "@/stores/store";
import { useToast } from "@/components/ui/Toast";
import {
  Menu,
  Eye,
  EyeOff,
  Settings,
  Download,
  FileText,
  FileCode,
  FileType,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const togglePreview = useStore((state) => state.togglePreview);
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);
  const { notify } = useToast();

  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = async (format: "markdown" | "html" | "pdf") => {
    if (!currentDocument) return;
    setExportOpen(false);

    try {
      const response = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentDocument.body,
          title: currentDocument.title,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentDocument.title}.${format === "markdown" ? "md" : format}`;
      a.click();
      URL.revokeObjectURL(url);

      notify(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      notify("Export failed");
    }
  };

  return (
    <nav className="h-14 bg-bg-navbar flex items-center justify-between px-4 z-navbar">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-text-invert hover:text-plum transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="text-plum font-bold text-lg hidden sm:block">
          DILLINGER
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="text-text-invert hover:text-plum transition-colors px-3 py-2
                       flex items-center gap-1 text-sm"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export as</span>
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full mt-1 bg-bg-navbar rounded shadow-lg py-1 min-w-[150px]">
              <button
                onClick={() => handleExport("markdown")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
              >
                <FileText size={16} />
                Markdown
              </button>
              <button
                onClick={() => handleExport("html")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
              >
                <FileCode size={16} />
                HTML
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="w-full px-4 py-2 text-left text-text-invert hover:bg-bg-highlight
                           flex items-center gap-2 text-sm"
              >
                <FileType size={16} />
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Preview toggle */}
        <button
          onClick={togglePreview}
          className="text-text-invert hover:text-plum transition-colors p-2"
          title={previewVisible ? "Hide preview" : "Show preview"}
        >
          {previewVisible ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          className="text-text-invert hover:text-plum transition-colors p-2"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add components/navbar/Navbar.tsx && git commit -m "feat: add Navbar with export dropdown and toggles"
```

---

### Task 5.4: Create Document Title Component

**Files:**
- Create: `next-app/components/editor/DocumentTitle.tsx`

**Step 1: Create editable title component**

Create `next-app/components/editor/DocumentTitle.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/stores/store";
import { Edit2, Check } from "lucide-react";

export function DocumentTitle() {
  const currentDocument = useStore((state) => state.currentDocument);
  const updateDocumentTitle = useStore((state) => state.updateDocumentTitle);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    setTitle(currentDocument?.title || "");
  }, [currentDocument?.title]);

  const handleSave = () => {
    if (title.trim()) {
      updateDocumentTitle(title.trim());
    } else {
      setTitle(currentDocument?.title || "Untitled");
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(currentDocument?.title || "");
      setIsEditing(false);
    }
  };

  if (!currentDocument) return null;

  return (
    <div className="h-12 bg-border-light flex items-center px-4 border-b border-border-light">
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-white px-2 py-1 rounded border border-border-light
                       focus:outline-none focus:border-plum text-text-primary"
          />
          <button
            onClick={handleSave}
            className="text-plum hover:opacity-70 transition-opacity"
          >
            <Check size={20} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <h2 className="text-text-primary font-medium truncate">
            {currentDocument.title}
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-text-muted hover:text-plum transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/editor/DocumentTitle.tsx && git commit -m "feat: add editable DocumentTitle component"
```

---

### Task 5.5: Create Settings Modal

**Files:**
- Create: `next-app/components/modals/SettingsModal.tsx`

**Step 1: Create settings modal component**

Create `next-app/components/modals/SettingsModal.tsx`:

```typescript
"use client";

import { useStore } from "@/stores/store";
import { X } from "lucide-react";

export function SettingsModal() {
  const settingsOpen = useStore((state) => state.settingsOpen);
  const settings = useStore((state) => state.settings);
  const toggleSettings = useStore((state) => state.toggleSettings);
  const updateSettings = useStore((state) => state.updateSettings);

  if (!settingsOpen) return null;

  return (
    <div className="fixed inset-0 z-settings">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={toggleSettings}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-80 bg-bg-navbar shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border-settings">
          <h2 className="text-text-invert font-semibold">Settings</h2>
          <button
            onClick={toggleSettings}
            className="text-text-invert hover:text-plum transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Auto Save */}
          <SettingToggle
            label="Auto Save"
            checked={settings.enableAutoSave}
            onChange={(v) => updateSettings({ enableAutoSave: v })}
          />

          {/* Word Count */}
          <SettingToggle
            label="Word Count"
            checked={settings.enableWordsCount}
            onChange={(v) => updateSettings({ enableWordsCount: v })}
          />

          {/* Character Count */}
          <SettingToggle
            label="Character Count"
            checked={settings.enableCharactersCount}
            onChange={(v) => updateSettings({ enableCharactersCount: v })}
          />

          {/* Night Mode */}
          <SettingToggle
            label="Night Mode"
            checked={settings.enableNightMode}
            onChange={(v) => updateSettings({ enableNightMode: v })}
          />

          {/* Tab Size */}
          <div className="flex items-center justify-between">
            <span className="text-text-invert text-sm">Tab Size</span>
            <select
              value={settings.tabSize}
              onChange={(e) => updateSettings({ tabSize: Number(e.target.value) })}
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>

          {/* Keybindings */}
          <div className="flex items-center justify-between">
            <span className="text-text-invert text-sm">Keybindings</span>
            <select
              value={settings.keybindings}
              onChange={(e) =>
                updateSettings({
                  keybindings: e.target.value as "default" | "vim" | "emacs",
                })
              }
              className="bg-bg-highlight text-text-invert px-2 py-1 rounded text-sm"
            >
              <option value="default">Default</option>
              <option value="vim">Vim</option>
              <option value="emacs">Emacs</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-invert text-sm">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${
          checked ? "bg-plum" : "bg-switchery"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/modals/SettingsModal.tsx && git commit -m "feat: add SettingsModal component"
```

---

## Phase 6: Main Page Assembly

### Task 6.1: Create Main Editor Page

**Files:**
- Modify: `next-app/app/page.tsx`

**Step 1: Assemble the main page**

Update `next-app/app/page.tsx`:

```typescript
"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Navbar } from "@/components/navbar/Navbar";
import { DocumentTitle } from "@/components/editor/DocumentTitle";
import { MonacoEditor } from "@/components/editor/MonacoEditor";
import { MarkdownPreview } from "@/components/preview/MarkdownPreview";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { useStore } from "@/stores/store";

export default function EditorPage() {
  const previewVisible = useStore((state) => state.previewVisible);
  const currentDocument = useStore((state) => state.currentDocument);

  // Show loading state while hydrating
  if (!currentDocument) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <DocumentTitle />

        {/* Editor + Preview */}
        <div className="flex-1 flex min-h-0">
          {/* Editor Panel */}
          <div
            className={`${
              previewVisible ? "w-1/2" : "w-full"
            } border-r border-border-light`}
          >
            <MonacoEditor />
          </div>

          {/* Preview Panel */}
          {previewVisible && (
            <div className="w-1/2">
              <MarkdownPreview />
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal />
    </div>
  );
}
```

**Step 2: Verify dev server works**

```bash
npm run dev
```
Expected: App runs at http://localhost:3000 with editor and preview visible

**Step 3: Commit**

```bash
git add app/page.tsx && git commit -m "feat: assemble main editor page with all components"
```

---

## Phase 7: API Routes

### Task 7.1: Create Markdown Export Route

**Files:**
- Create: `next-app/app/api/export/markdown/route.ts`

**Step 1: Create markdown export API**

Create `next-app/app/api/export/markdown/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const filename = `${title || "document"}.md`;

    return new NextResponse(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export markdown" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/export/markdown/route.ts && git commit -m "feat: add markdown export API route"
```

---

### Task 7.2: Create HTML Export Route

**Files:**
- Create: `next-app/app/api/export/html/route.ts`

**Step 1: Create HTML export API**

Create `next-app/app/api/export/html/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/markdown";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const htmlContent = renderMarkdown(markdown);
    const filename = `${title || "document"}.html`;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Document"}</title>
  <style>
    body {
      font-family: Georgia, Cambria, serif;
      font-size: 14px;
      line-height: 1.7;
      color: #373D49;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: "Source Sans Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    a { color: #35D7BB; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: "Ubuntu Mono", Monaco, monospace;
      background: #F5F7FA;
      padding: 0.2em 0.4em;
      border-radius: 3px;
    }
    pre {
      background: #F5F7FA;
      padding: 1em;
      border-radius: 3px;
      overflow-x: auto;
    }
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 3px solid #A0AABF;
      padding-left: 1em;
      margin-left: 0;
      font-style: italic;
      color: #666;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #E8E8E8; padding: 0.5em; text-align: left; }
    th { background: #F5F7FA; font-weight: 600; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to export HTML" },
      { status: 500 }
    );
  }
}
```

**Step 2: Commit**

```bash
git add app/api/export/html/route.ts && git commit -m "feat: add HTML export API route with styling"
```

---

### Task 7.3: Create PDF Export Route

**Files:**
- Create: `next-app/app/api/export/pdf/route.ts`
- Modify: `next-app/package.json` (add md-to-pdf)

**Step 1: Install md-to-pdf**

```bash
npm install md-to-pdf
```

**Step 2: Create PDF export API**

Create `next-app/app/api/export/pdf/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { mdToPdf } from "md-to-pdf";

export async function POST(request: NextRequest) {
  try {
    const { markdown, title } = await request.json();

    if (!markdown) {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 }
      );
    }

    const pdf = await mdToPdf(
      { content: markdown },
      {
        pdf_options: {
          format: "A4",
          margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
        },
      }
    );

    if (!pdf || !pdf.content) {
      throw new Error("PDF generation failed");
    }

    const filename = `${title || "document"}.pdf`;

    return new NextResponse(pdf.content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to export PDF" },
      { status: 500 }
    );
  }
}
```

**Step 3: Commit**

```bash
git add app/api/export/pdf/route.ts package.json package-lock.json && git commit -m "feat: add PDF export API route using md-to-pdf"
```

---

## Phase 8: Final Integration & Testing

### Task 8.1: Verify Full Application

**Step 1: Run development server**

```bash
npm run dev
```

**Step 2: Manual testing checklist**

- [ ] App loads with default document
- [ ] Can edit markdown in Monaco editor
- [ ] Preview updates in real-time
- [ ] Can create new document
- [ ] Can switch between documents
- [ ] Can delete document (if more than one)
- [ ] Can rename document
- [ ] Can toggle preview visibility
- [ ] Settings modal opens/closes
- [ ] Night mode toggle works
- [ ] Export to Markdown works
- [ ] Export to HTML works
- [ ] Export to PDF works
- [ ] Documents persist across page reload

**Step 3: Run build**

```bash
npm run build
```
Expected: Build succeeds without errors

**Step 4: Final commit**

```bash
git add -A && git commit -m "feat: complete Dillinger Next.js migration - Phase 1"
```

---

## Summary

This plan covers Phase 1 of the migration:

**Completed:**
- Next.js project setup with TypeScript and Tailwind
- Zustand state management with localStorage persistence
- Monaco Editor integration
- markdown-it rendering with all plugins
- Sidebar with document list
- Navbar with export dropdown
- Settings modal
- Export API routes (Markdown, HTML, PDF)

**Deferred to Phase 2:**
- GitHub OAuth integration
- Dropbox OAuth integration
- Resizable panels
- Vim/Emacs keybindings
- Word count display
- Scroll sync
