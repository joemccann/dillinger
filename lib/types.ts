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

export const DEFAULT_DOCUMENT_BODY = `# Welcome to Dillinger

A clean, distraction-free markdown editor. Type on the left, see the rendered output on the right.

---

## Text Formatting

Markdown makes it easy to format text. You can write in **bold**, *italic*, or ~~strikethrough~~. Combine them for ***bold italic*** text. Use \`inline code\` for technical terms.

## Lists

Unordered lists use dashes, asterisks, or plus signs:

- Import files from GitHub, Dropbox, or Google Drive
- Export to Markdown, HTML, or PDF
- Drag and drop files directly into the editor

Ordered lists are numbered automatically:

1. Write your markdown
2. Preview the rendered output
3. Export or save to the cloud

Nested lists work too:

- Cloud integrations
  - GitHub repositories
  - Dropbox folders
  - Google Drive files
  - OneDrive and Bitbucket
- Local features
  - Auto-save to browser storage
  - Image paste from clipboard

## Task Lists

- [x] Set up the editor
- [x] Write some markdown
- [ ] Connect a cloud service
- [ ] Export the finished document

## Links and Images

Link to any page with [inline links](https://dillinger.io) or use [reference-style links][dillinger].

Images use a similar syntax:

![Placeholder](https://via.placeholder.com/600x200/2B2F36/35D7BB?text=Your+Image+Here)

[dillinger]: https://dillinger.io

## Blockquotes

> The art of writing is the art of discovering what you believe.
>
> — Gustave Flaubert

Blockquotes can contain other markdown elements:

> **Tip:** Use \`Cmd+Shift+Z\` to enter zen mode for distraction-free writing.

## Code

Fenced code blocks support syntax highlighting:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}.\`;
}

console.log(greet("world"));
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

## Tables

| Shortcut | Action |
|----------|--------|
| \`⌘ ⇧ Z\` | Toggle zen mode |
| \`Escape\` | Exit zen mode |
| \`?\` | Keyboard shortcuts |

Tables support alignment:

| Feature | Status | Notes |
|:--------|:------:|------:|
| Markdown editing | Active | Monaco-powered |
| Live preview | Active | Scroll-synced |
| Cloud sync | Available | 5 providers |
| PDF export | Available | Server-rendered |

## Footnotes

Dillinger supports extended markdown syntax including footnotes[^1] and definition lists.

[^1]: Footnotes appear at the bottom of the rendered preview.

## Math

Inline math: $E = mc^2$

Block equations:

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

*Your documents save automatically. Start writing.*
`;
