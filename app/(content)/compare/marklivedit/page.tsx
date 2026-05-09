import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dillinger vs MarkLiveEdit",
  description:
    "Compare Dillinger and MarkLiveEdit: features, exports, cloud sync, and editor experience. See how the long-trusted Dillinger compares to the newer alternative.",
  alternates: { canonical: "https://dillinger.io/compare/marklivedit" },
};

const COMPARISON = [
  { feature: "Price", dillinger: "Free", competitor: "Free" },
  { feature: "Platform", dillinger: "Web (any browser)", competitor: "Web (any browser)" },
  { feature: "Signup required", dillinger: "No", competitor: "No" },
  { feature: "Editor engine", dillinger: "Monaco (VS Code)", competitor: "Plain editor" },
  { feature: "Live preview", dillinger: "Side-by-side", competitor: "Side-by-side" },
  { feature: "Multiple documents", dillinger: "Yes", competitor: "No" },
  { feature: "Document persistence", dillinger: "Yes (localStorage)", competitor: "No" },
  { feature: "GitHub sync", dillinger: "Yes", competitor: "No" },
  { feature: "Dropbox sync", dillinger: "Yes", competitor: "No" },
  { feature: "Google Drive sync", dillinger: "Yes", competitor: "No" },
  { feature: "OneDrive sync", dillinger: "Yes", competitor: "No" },
  { feature: "Bitbucket sync", dillinger: "Yes", competitor: "No" },
  { feature: "PDF export", dillinger: "Yes", competitor: "Yes" },
  { feature: "HTML export", dillinger: "Yes", competitor: "No" },
  { feature: "DOCX / Word export", dillinger: "No", competitor: "Yes" },
  { feature: "LaTeX / math support", dillinger: "Yes (KaTeX)", competitor: "Yes" },
  { feature: "Mermaid diagrams", dillinger: "No", competitor: "Yes" },
  { feature: "Vim / Emacs keybindings", dillinger: "Yes", competitor: "No" },
  { feature: "Zen / focus mode", dillinger: "Yes", competitor: "No" },
  { feature: "Years in production", dillinger: "10+", competitor: "Newer entrant" },
];

export default function MarkLiveEditCompare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Comparison
      </p>
      <h1 className="text-4xl font-bold mb-4">Dillinger vs MarkLiveEdit</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        MarkLiveEdit is a newer, lightweight web markdown editor with PDF and
        Word export and built-in support for LaTeX and diagrams. Dillinger is a
        decade-old, production-trusted editor with the Monaco engine, broader
        cloud sync, and a workflow built around multiple documents.
      </p>

      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 pr-4 font-semibold">Feature</th>
              <th className="text-left py-3 px-4 font-semibold text-plum">
                Dillinger
              </th>
              <th className="text-left py-3 pl-4 font-semibold">MarkLiveEdit</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.feature} className="border-b border-border-light/50">
                <td className="py-3 pr-4 text-text-muted">{row.feature}</td>
                <td className="py-3 px-4">{row.dillinger}</td>
                <td className="py-3 pl-4 text-text-muted">{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose Dillinger</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You want a tool that has been battle-tested in production for over a decade</li>
          <li>You sync to GitHub, Dropbox, Google Drive, OneDrive, or Bitbucket</li>
          <li>You manage multiple documents that should persist between sessions</li>
          <li>You want the VS Code editing experience with Vim or Emacs keybindings</li>
          <li>You need a focus / zen mode for distraction-free writing</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose MarkLiveEdit</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You need to export markdown to Word / DOCX</li>
          <li>You want Mermaid diagrams rendered in the preview</li>
          <li>You only need a single-document scratchpad with quick exports</li>
        </ul>
      </section>

      <div className="pt-8 border-t border-border-light flex gap-4">
        <Link
          href="/"
          className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Try Dillinger Free
        </Link>
        <Link
          href="/compare"
          className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
        >
          More Comparisons
        </Link>
      </div>
    </div>
  );
}
