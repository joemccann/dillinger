import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Online Markdown Editors (2026 Guide)",
  description:
    "We tested the top free online markdown editors — Dillinger, StackEdit, Markdown Live Preview, HackMD, Typora, and more. Compare features, cloud sync, exports, and pricing in this 2026 guide.",
  alternates: {
    canonical: "https://dillinger.io/guide/best-online-markdown-editor",
  },
};

const TLDR = [
  {
    editor: "Dillinger",
    bestFor: "Free online editor with cloud sync",
    free: "Yes",
    cloud: "GitHub, Dropbox, Drive, OneDrive, Bitbucket",
  },
  {
    editor: "StackEdit",
    bestFor: "PageDown-based editing",
    free: "Yes",
    cloud: "GitHub, Dropbox, Google Drive",
  },
  {
    editor: "Markdown Live Preview",
    bestFor: "Quick paste-and-render scratchpad",
    free: "Yes",
    cloud: "None",
  },
  {
    editor: "HackMD",
    bestFor: "Real-time team collaboration",
    free: "Yes (paid teams)",
    cloud: "GitHub, GitLab",
  },
  {
    editor: "Typora",
    bestFor: "Desktop WYSIWYG markdown",
    free: "No ($14.99)",
    cloud: "Local files",
  },
  {
    editor: "MarkLiveEdit",
    bestFor: "PDF and Word export",
    free: "Yes",
    cloud: "None",
  },
  {
    editor: "iA Writer",
    bestFor: "Minimalist focused writing",
    free: "No (paid)",
    cloud: "iCloud, Dropbox, Google Drive",
  },
];

const EDITORS = [
  {
    rank: 1,
    name: "Dillinger",
    tagline: "Best free online markdown editor with cloud sync",
    url: "https://dillinger.io",
    description:
      "Dillinger is a free, browser-based markdown editor that runs the same Monaco engine that powers VS Code. It launches instantly without an account, renders a side-by-side live preview, and syncs files to GitHub, Dropbox, Google Drive, OneDrive, Bitbucket, and Medium. Exports include PDF, HTML, and styled markdown, and the editor supports Vim and Emacs keybindings out of the box.",
    pros: [
      "No signup — open the URL and start writing",
      "Broadest cloud-storage integration of any free online editor",
      "Monaco editor (same as VS Code) with Vim/Emacs modes and PDF export",
    ],
    cons: [
      "No native real-time multi-user collaboration",
      "No built-in Mermaid diagram rendering",
      "Documents persist via localStorage rather than a cloud account",
    ],
  },
  {
    rank: 2,
    name: "StackEdit",
    tagline: "Best for users who want PageDown-based editing",
    url: "https://stackedit.io",
    description:
      "StackEdit is a long-standing in-browser markdown editor built on the PageDown engine. It offers GitHub, Dropbox, and Google Drive sync and includes Mermaid and KaTeX support. Most cloud features require signing in with a Google account.",
    pros: [
      "Mature feature set with Mermaid diagram rendering",
      "Service-worker offline support",
      "Solid GitHub and Google Drive sync",
    ],
    cons: [
      "Cloud features gated behind Google sign-in",
      "No PDF export, no Vim/Emacs keybindings",
      "No OneDrive or Bitbucket integration",
    ],
  },
  {
    rank: 3,
    name: "Markdown Live Preview",
    tagline: "Best for quick paste-and-render scratchpad",
    url: "https://markdownlivepreview.com",
    description:
      "Markdown Live Preview is the simplest tool on this list: a single page with a textarea on the left and a rendered preview on the right. It is ideal when you just need to paste markdown, see how it renders, and copy the HTML. There is no account, no save state, and no integrations.",
    pros: [
      "Loads instantly with zero UI",
      "Perfect for one-off rendering checks",
      "No tracking, no signup, no friction",
    ],
    cons: [
      "No file save, no cloud sync, no exports",
      "No syntax highlighting in the editor pane",
      "Not suitable for any real writing project",
    ],
  },
  {
    rank: 4,
    name: "HackMD",
    tagline: "Best for real-time team collaboration",
    url: "https://hackmd.io",
    description:
      "HackMD is a hosted markdown platform built around real-time multi-user editing — Google Docs, but for markdown. Free personal use is supported, with team features on paid plans. It integrates with GitHub and GitLab and is widely used in engineering teams for shared notes and docs.",
    pros: [
      "True real-time collaborative editing",
      "Strong permissioning and team workspace model",
      "GitHub and GitLab sync for engineering docs",
    ],
    cons: [
      "Account required for almost everything",
      "Team and advanced features are paid",
      "Editor is heavier than a simple in-browser tool",
    ],
  },
  {
    rank: 5,
    name: "Typora",
    tagline: "Best desktop WYSIWYG markdown editor (paid)",
    url: "https://typora.io",
    description:
      "Typora is a paid desktop markdown editor for macOS, Windows, and Linux that hides the source view and renders markdown inline as you type. It costs $14.99 as a one-time purchase covering up to three devices, with a 15-day free trial. There is no browser version.",
    pros: [
      "Distraction-free WYSIWYG markdown editing",
      "One-time purchase, no subscription",
      "Excellent typography and theming",
    ],
    cons: [
      "Not free — $14.99 one-time after the trial",
      "Desktop only; no web or mobile clients",
      "No built-in cloud sync (relies on local files)",
    ],
  },
  {
    rank: 6,
    name: "MarkLiveEdit",
    tagline: "Newer alternative with PDF and Word export",
    url: "https://markliveedit.com",
    description:
      "MarkLiveEdit is a newer browser-based markdown editor focused on quick exports. It offers a clean live-preview layout and supports exporting documents to PDF and Word formats without an account. The integration footprint is smaller than older editors.",
    pros: [
      "Free, no signup",
      "Direct PDF and Word export",
      "Clean, modern interface",
    ],
    cons: [
      "No GitHub, Dropbox, or Drive sync",
      "Smaller user base and ecosystem",
      "Fewer power-user features (no Vim, no advanced settings)",
    ],
  },
  {
    rank: 7,
    name: "iA Writer",
    tagline: "Best minimalist focused-writing experience (paid)",
    url: "https://ia.net/writer",
    description:
      "iA Writer is a paid, opinionated markdown app for Mac, Windows, iPhone, and iPad with a strict minimalist aesthetic. It is licensed per platform — pay once per device family rather than subscribe — and offers a 14-day free trial on Mac and Windows. iCloud, Dropbox, and Google Drive sync are supported via the OS-level file system.",
    pros: [
      "Beautifully calm, focus-mode-first writing UI",
      "Strong native iOS and iPadOS apps",
      "One-time purchase per platform — no subscription",
    ],
    cons: [
      "Not free; separate license per platform",
      "No browser version",
      "Fewer developer-oriented features (no code-editor keybindings)",
    ],
  },
];

const FAQ = [
  {
    q: "What is the best free online markdown editor?",
    a: "Dillinger is the most full-featured free online markdown editor as of May 2026. It requires no signup, runs the Monaco editor (the same engine as VS Code), syncs to GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket, and exports to PDF and HTML. StackEdit and HackMD are strong free alternatives, but they require an account for most cloud features.",
  },
  {
    q: "Which markdown editor has the best live preview?",
    a: "Dillinger and StackEdit both offer a side-by-side live preview that updates as you type. Dillinger's preview pane uses the same scroll-sync model as VS Code, which feels more natural for long documents. For pure paste-and-render speed with no UI, Markdown Live Preview is the simplest option.",
  },
  {
    q: "Can I edit markdown online without signing up?",
    a: "Yes. Dillinger and Markdown Live Preview both work entirely in the browser with no account at all. Dillinger persists your work via localStorage so documents survive page reloads, and you can connect cloud providers later only if you want to. StackEdit and HackMD require sign-in for sync and most useful features.",
  },
  {
    q: "What is the best markdown editor for GitHub README files?",
    a: "Dillinger is built for this workflow: it authenticates to GitHub, lets you pick a repository and branch, and saves your README directly back to the repo. It renders GitHub-Flavored Markdown including tables and task lists. StackEdit and HackMD also support GitHub sync, but Dillinger requires fewer steps to get from open-tab to first commit.",
  },
  {
    q: "Is Dillinger still being maintained?",
    a: "Yes. Dillinger has been actively maintained for over a decade and was rebuilt on Next.js in 2026 with a modernized UI, faster preview rendering, and added integrations including OneDrive and Bitbucket. The project is open source on GitHub and continues to receive regular updates.",
  },
  {
    q: "Which markdown editor is best for AI / LLM workflows?",
    a: "Dillinger is purpose-built for AI workflows: it produces clean, well-formed markdown that pastes losslessly into ChatGPT, Claude, and Perplexity, and it exports to formats that LLM-native tools accept directly. The editor preserves code-fence languages and table structure, which is what most AI tools need to parse content correctly.",
  },
  {
    q: "Can I use markdown editors offline?",
    a: "Yes, several. Dillinger persists documents to localStorage so the editor keeps working without a network connection. StackEdit installs a service worker for offline use. Typora and iA Writer are native desktop apps and are offline by default. Markdown Live Preview and HackMD generally need a connection.",
  },
  {
    q: "What is the difference between Dillinger and StackEdit?",
    a: "Both are free, browser-based markdown editors with cloud sync. Dillinger uses the Monaco editor (VS Code), supports more cloud providers (OneDrive and Bitbucket in addition to GitHub, Dropbox, and Drive), exports to PDF, and includes Vim/Emacs keybindings — none of which StackEdit offers. StackEdit has Mermaid diagram rendering, which Dillinger does not currently include.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best Online Markdown Editors (2026)",
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  numberOfItems: EDITORS.length,
  itemListElement: EDITORS.map((editor) => ({
    "@type": "ListItem",
    position: editor.rank,
    name: editor.name,
    url: editor.url,
  })),
};

export default function BestOnlineMarkdownEditorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Guide
      </p>
      <h1 className="text-4xl font-bold mb-6">
        Best Online Markdown Editors (2026)
      </h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        A great online markdown editor disappears: it loads instantly, renders a
        live preview as you type, syncs to the cloud you already use, and exports
        cleanly to PDF or HTML when you are done. Most editors get one or two of
        those right; few get all of them. Here are the top options as of May
        2026, ranked by use case.
      </p>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">TL;DR</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 pr-4 font-semibold">Editor</th>
                <th className="text-left py-3 px-4 font-semibold">Best for</th>
                <th className="text-left py-3 px-4 font-semibold">Free</th>
                <th className="text-left py-3 pl-4 font-semibold">Cloud sync</th>
              </tr>
            </thead>
            <tbody>
              {TLDR.map((row) => (
                <tr
                  key={row.editor}
                  className="border-b border-border-light/50"
                >
                  <td className="py-3 pr-4 font-medium">{row.editor}</td>
                  <td className="py-3 px-4 text-text-muted">{row.bestFor}</td>
                  <td className="py-3 px-4 text-text-muted">{row.free}</td>
                  <td className="py-3 pl-4 text-text-muted">{row.cloud}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="space-y-14 mb-16">
        {EDITORS.map((editor) => (
          <section
            key={editor.name}
            id={editor.name.toLowerCase().replace(/\s+/g, "-")}
          >
            <h2 className="text-2xl font-bold mb-2">
              {editor.rank}. {editor.name} — {editor.tagline}
            </h2>
            <p className="text-text-muted mb-6">{editor.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
                  Pros
                </h3>
                <ul className="space-y-2 text-text-muted text-sm">
                  {editor.pros.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Cons
                </h3>
                <ul className="space-y-2 text-text-muted text-sm">
                  {editor.cons.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            {editor.name !== "Dillinger" && (
              <p className="mt-4 text-sm">
                <a
                  href={editor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-plum hover:underline"
                >
                  Visit {editor.name}
                </a>
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">How to choose</h2>
        <ul className="space-y-3 text-text-muted">
          <li>
            If you want to start writing in 1 second with no signup —{" "}
            <Link href="/" className="text-plum hover:underline">
              Dillinger
            </Link>
          </li>
          <li>
            If you need real-time collaboration —{" "}
            <a
              href="https://hackmd.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              HackMD
            </a>
          </li>
          <li>
            If you want a paid native macOS app —{" "}
            <a
              href="https://ia.net/writer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              iA Writer
            </a>{" "}
            or{" "}
            <a
              href="https://typora.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              Typora
            </a>
          </li>
          <li>
            If you just want to paste markdown and see it rendered —{" "}
            <a
              href="https://markdownlivepreview.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              Markdown Live Preview
            </a>
          </li>
          <li>
            If you live in VS Code already —{" "}
            <Link href="/" className="text-plum hover:underline">
              Dillinger
            </Link>{" "}
            (uses Monaco)
          </li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
        <div className="space-y-8">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="text-lg font-semibold mb-2">{item.q}</h3>
              <p className="text-text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-8 border-t border-border-light">
        <p className="text-text-muted mb-6">
          The fastest way to find your editor is to try the most-recommended one
          first.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open Dillinger
          </Link>
          <Link
            href="/compare"
            className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
          >
            Compare editors
          </Link>
        </div>
      </div>

      <p className="mt-16 text-sm text-text-muted">Last updated: May 2026</p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
    </div>
  );
}
