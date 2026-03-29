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
  enableScrollSync: true,
  tabSize: 4,
  keybindings: "default",
  enableNightMode: false,
  enableGitHubComment: true,
};

export const DEFAULT_DOCUMENT_BODY = `# Dillinger
## _The Last Markdown Editor, Ever_

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-orange)](https://zustand-demo.pmnd.rs/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://dillinger.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## License

MIT

**Free Software, Hell Yeah!**
`;
