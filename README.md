# Dillinger
## _The Last Markdown Editor, Ever_

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs/) [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://dillinger.io) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dillinger is a cloud-enabled, mobile-ready, offline-storage compatible
Markdown editor built with Next.js and React.

- Type some Markdown on the left
- See HTML in the right
- Magic

## Features

- **Monaco Editor** with markdown syntax highlighting and Vim/Emacs keybindings
- **Live Preview** with real-time markdown rendering and scroll sync
- **Zen Mode** for distraction-free fullscreen editing
- **Cloud Integrations** — import and save files from GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket
- **Export** documents as Markdown, HTML, and PDF
- **Import** markdown, HTML, and text files via drag and drop or file picker
- **Image Paste** — paste images directly into the editor
- **Local Storage** — documents persist automatically in your browser
- **Dark Mode** — night mode for comfortable editing

## Tech

Dillinger is built with:

- [Next.js 14](https://nextjs.org/) — React framework with App Router
- [React 18](https://react.dev/) — UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) — VS Code's editor
- [markdown-it](https://github.com/markdown-it/markdown-it) — Markdown parser with plugins
- [Zustand](https://zustand-demo.pmnd.rs/) — State management with localStorage persistence
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Lucide React](https://lucide.dev/) — Icons

Deployed on [Vercel](https://vercel.com/).

## Getting Started

Dillinger requires [Node.js](https://nodejs.org/) v18+ to run.

```sh
cd next-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For production:

```sh
npm run build
npm start
```

## Configuration

Create a `.env.local` file in the `next-app` directory to enable cloud integrations:

```sh
# App URL (used for all OAuth redirects)
NEXT_PUBLIC_APP_URL=https://dillinger.io

# GitHub
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Dropbox
DROPBOX_APP_KEY=
DROPBOX_APP_SECRET=

# Google Drive
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OneDrive
ONEDRIVE_CLIENT_ID=
ONEDRIVE_CLIENT_SECRET=

# Bitbucket
BITBUCKET_CLIENT_ID=
BITBUCKET_CLIENT_SECRET=
```

## Cloud Integrations

| Service | Features |
| ------- | -------- |
| GitHub | Browse orgs/repos/branches, import and save files |
| Dropbox | Browse folders, import and save files |
| Google Drive | Browse folders, import and save files |
| OneDrive | Browse folders, import and save files |
| Bitbucket | Browse workspaces/repos/branches, import and save files |

Each integration uses OAuth 2.0 with tokens stored in HTTP-only cookies.

## Development

```sh
cd next-app
npm run dev       # Start dev server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript checks
npm run test:unit # Run Vitest unit tests
npm run build     # Production build
```

## Project Structure

```
next-app/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers (OAuth, export, upload)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main editor page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── editor/            # Monaco editor, document title
│   ├── preview/           # Markdown preview pane
│   ├── navbar/            # Top navigation bar
│   ├── sidebar/           # Document list + cloud integrations
│   ├── modals/            # OAuth and settings dialogs
│   └── ui/                # Toast, skeleton loaders
├── hooks/                 # Custom hooks (useGitHub, useDropbox, etc.)
├── stores/                # Zustand store
├── lib/                   # Utilities (markdown, export, import)
└── tests/                 # Vitest + Playwright tests
```

## License

MIT

**Free Software, Hell Yeah!**
