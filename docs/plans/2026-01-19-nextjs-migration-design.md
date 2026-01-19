# Dillinger Next.js Migration Design

**Date:** 2026-01-19
**Status:** Approved
**Scope:** Full stack migration from Angular.js to Next.js App Router

---

## Overview

Migrate the Dillinger markdown editor from Angular.js 1.8.3 to Next.js 14 with App Router, maintaining 100% functional parity and visual consistency.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14 (App Router) | Modern React, Vercel-optimized, API routes |
| Editor | Monaco Editor | Better maintained than Ace, VS Code familiar |
| Persistence | localStorage only | Matches original, no database needed |
| Cloud integrations | GitHub + Dropbox initially | Core services first, pattern for others |
| Markdown | markdown-it + plugins | Identical rendering output |
| Styling | Tailwind CSS | Design tokens extracted from SCSS |
| State | Zustand | Simple, performant, localStorage middleware |
| Export | Server-side PDF | md-to-pdf via API routes |

---

## Project Structure

```
dillinger-next/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Main editor page
│   ├── globals.css             # Tailwind + custom CSS
│   └── api/
│       ├── export/
│       │   ├── html/route.ts
│       │   ├── pdf/route.ts
│       │   └── markdown/route.ts
│       ├── convert/
│       │   └── html-to-md/route.ts
│       ├── github/
│       │   ├── oauth/route.ts
│       │   ├── callback/route.ts
│       │   ├── orgs/route.ts
│       │   ├── repos/route.ts
│       │   ├── branches/route.ts
│       │   ├── files/route.ts
│       │   └── save/route.ts
│       └── dropbox/
│           ├── oauth/route.ts
│           ├── callback/route.ts
│           ├── files/route.ts
│           └── save/route.ts
├── components/
│   ├── editor/
│   │   ├── MonacoEditor.tsx
│   │   └── EditorToolbar.tsx
│   ├── preview/
│   │   └── MarkdownPreview.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   └── DocumentList.tsx
│   ├── navbar/
│   │   └── Navbar.tsx
│   ├── modals/
│   │   ├── GitHubModal.tsx
│   │   ├── DropboxModal.tsx
│   │   ├── DeleteModal.tsx
│   │   └── SettingsModal.tsx
│   └── ui/
│       ├── Toast.tsx
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Switch.tsx
├── hooks/
│   ├── useDocuments.ts
│   ├── useUserSettings.ts
│   ├── useGitHub.ts
│   ├── useDropbox.ts
│   └── useMarkdown.ts
├── stores/
│   └── store.ts
├── lib/
│   ├── markdown.ts
│   └── storage.ts
└── tailwind.config.ts
```

---

## State Management

### Zustand Store

```typescript
interface Document {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  github?: {
    sha: string;
    path: string;
    repo: string;
    owner: string;
    branch: string;
  };
}

interface UserSettings {
  enableAutoSave: boolean;
  enableWordsCount: boolean;
  enableScrollSync: boolean;
  tabSize: number;
  keybindings: 'default' | 'vim' | 'emacs';
  enableNightMode: boolean;
}

interface AppState {
  documents: Document[];
  currentDocument: Document | null;
  settings: UserSettings;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  previewVisible: boolean;
  zenMode: boolean;

  // Actions
  createDocument: () => void;
  selectDocument: (id: string) => void;
  deleteDocument: (id: string) => void;
  updateDocumentBody: (body: string) => void;
  updateDocumentTitle: (title: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  hydrate: () => void;
  persist: () => void;
}
```

### Persistence

- `hydrate()` loads from localStorage on mount
- `persist()` saves to localStorage (debounced 2 seconds)
- Keys: `files`, `currentDocument`, `profileV3` (compatible with original)

---

## Tailwind Configuration

Design tokens extracted from legacy SCSS `_config.scss`:

```typescript
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        plum: '#35D7BB',
        'bg-primary': '#ffffff',
        'bg-sidebar': '#2B2F36',
        'bg-navbar': '#373D49',
        'bg-highlight': '#1D212A',
        'bg-button-save': '#4A5261',
        'text-primary': '#373D49',
        'text-invert': '#ffffff',
        'text-muted': '#A0AABF',
        'border-light': '#E8E8E8',
        'border-settings': '#4F535B',
        'icon-default': '#D3DAEA',
        'dropdown-link': '#D0D6E2',
        'switchery': '#4B5363',
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
        mono: ['"Ubuntu Mono"', 'Monaco', 'monospace'],
      },
      spacing: {
        sidebar: '270px',
        gutter: '32px',
      },
      zIndex: {
        sidebar: '1',
        page: '2',
        editor: '3',
        preview: '4',
        overlay: '5',
        navbar: '6',
        settings: '7',
      },
    },
  },
};
```

---

## Component Architecture

### Main Page Layout

```tsx
export default function EditorPage() {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Navbar />
        <DocumentTitle />
        <div className="flex-1 flex">
          <ResizablePanel>
            <MonacoEditor />
          </ResizablePanel>
          <ResizablePanel>
            <MarkdownPreview />
          </ResizablePanel>
        </div>
      </main>
      <ModalProvider />
    </div>
  );
}
```

### Component Types

All major components are Client Components (`'use client'`) due to:
- Monaco Editor (browser API)
- localStorage access
- Event handlers and interactivity

---

## Monaco Editor Configuration

```tsx
<Editor
  height="100%"
  language="markdown"
  theme={settings.enableNightMode ? 'vs-dark' : 'vs'}
  value={currentDocument?.body ?? ''}
  onChange={handleChange}
  options={{
    fontSize: 14,
    fontFamily: '"Ubuntu Mono", Monaco, monospace',
    lineHeight: 24,
    wordWrap: 'on',
    minimap: { enabled: false },
    lineNumbers: 'off',
    tabSize: settings.tabSize,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  }}
/>
```

### Keybindings

- Default: Standard Monaco
- Vim: `monaco-vim` package
- Emacs: `monaco-emacs` package

---

## Markdown Rendering

```typescript
import MarkdownIt from 'markdown-it';
// + 8 plugins: abbr, checkbox, deflist, footnote, ins, mark, sub, sup, toc
// + highlight.js for code syntax
// + KaTeX for math

export const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => hljs.highlight(str, { language: lang }).value,
})
  .use(markdownItAbbr)
  .use(markdownItCheckbox)
  // ... all plugins
```

---

## API Routes

### Export Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/export/pdf` | POST | Generate PDF via md-to-pdf |
| `/api/export/html` | POST | Generate styled HTML |
| `/api/export/markdown` | POST | Return raw markdown |
| `/api/convert/html-to-md` | POST | Convert HTML to Markdown |

### GitHub Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/github/oauth` | GET | Initiate OAuth flow |
| `/api/github/callback` | GET | OAuth callback, set cookie |
| `/api/github/orgs` | GET | List user organizations |
| `/api/github/repos` | GET | List repositories |
| `/api/github/branches` | GET | List branches |
| `/api/github/files` | POST | List/fetch files |
| `/api/github/save` | POST | Save file to repo |

### Dropbox Routes

Same pattern as GitHub.

### Token Storage

OAuth tokens stored in HTTP-only cookies:
- Secure, not accessible to JavaScript
- Automatically sent with API requests
- No session database required

---

## Notifications

Custom Toast context replacing Angular's diNotify:

```tsx
const { notify } = useToast();
notify('Document saved successfully');
notify('Uploading...', 5000);  // Custom duration
notify('Processing...', 0);    // Persistent
```

---

## Integration Hooks

```typescript
function useGitHub() {
  return {
    isAuthenticated,
    orgs, repos, branches, files,
    current: { owner, repo, branch, path, sha },
    authenticate,
    fetchOrgs,
    fetchRepos,
    fetchBranches,
    fetchFiles,
    saveFile,
  };
}
```

---

## Deferred Features

To be added in future iterations:
- Google Drive integration
- OneDrive integration
- Medium integration
- Bitbucket integration
- Zen mode (fullscreen editing)
- Image upload to Dropbox
- Scroll sync between editor and preview

---

## Dependencies

### Production

```json
{
  "next": "^14.0.0",
  "@monaco-editor/react": "^4.6.0",
  "markdown-it": "^14.0.0",
  "markdown-it-*": "various plugins",
  "highlight.js": "^11.0.0",
  "katex": "^0.16.0",
  "zustand": "^4.4.0",
  "lucide-react": "^0.300.0",
  "md-to-pdf": "^5.0.0",
  "breakdance": "^4.0.0"
}
```

### Development

```json
{
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0"
}
```

---

## Migration Compatibility

localStorage keys maintained for seamless migration:
- `files` - Document array
- `currentDocument` - Active document
- `profileV3` - User settings

Users' existing documents will be preserved when switching to the new app.
