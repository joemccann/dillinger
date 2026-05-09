import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dillinger vs Markdown Live Preview",
  description:
    "Compare Dillinger and Markdown Live Preview: features, cloud sync, persistence, and exports. Both are free online markdown editors — see which fits your workflow.",
  alternates: { canonical: "https://dillinger.io/compare/markdownlivepreview" },
};

const COMPARISON = [
  { feature: "Price", dillinger: "Free", competitor: "Free" },
  { feature: "Signup required", dillinger: "No", competitor: "No" },
  { feature: "Open source", dillinger: "No", competitor: "Yes" },
  { feature: "Editor engine", dillinger: "Monaco (VS Code)", competitor: "Plain textarea" },
  { feature: "Live preview", dillinger: "Side-by-side", competitor: "Side-by-side" },
  { feature: "Multiple documents", dillinger: "Yes", competitor: "No" },
  { feature: "Document persistence", dillinger: "Yes (localStorage)", competitor: "No (single scratchpad)" },
  { feature: "GitHub sync", dillinger: "Yes", competitor: "No" },
  { feature: "Dropbox sync", dillinger: "Yes", competitor: "No" },
  { feature: "Google Drive sync", dillinger: "Yes", competitor: "No" },
  { feature: "OneDrive sync", dillinger: "Yes", competitor: "No" },
  { feature: "Bitbucket sync", dillinger: "Yes", competitor: "No" },
  { feature: "PDF export", dillinger: "Yes", competitor: "Yes" },
  { feature: "HTML export", dillinger: "Yes", competitor: "No" },
  { feature: "Vim keybindings", dillinger: "Yes", competitor: "No" },
  { feature: "Emacs keybindings", dillinger: "Yes", competitor: "No" },
  { feature: "Syntax highlighting in editor", dillinger: "Yes", competitor: "No" },
  { feature: "Dark mode", dillinger: "Yes", competitor: "Yes" },
  { feature: "Zen / focus mode", dillinger: "Yes", competitor: "No" },
  { feature: "Privacy (data stays local)", dillinger: "Yes", competitor: "Yes" },
];

export default function MarkdownLivePreviewCompare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Comparison
      </p>
      <h1 className="text-4xl font-bold mb-4">Dillinger vs Markdown Live Preview</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Markdown Live Preview is a minimal, open-source scratchpad for rendering
        a single piece of markdown in your browser. Dillinger is a full
        workflow editor with cloud sync, multiple documents, and the Monaco
        editor from VS Code.
      </p>

      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 pr-4 font-semibold">Feature</th>
              <th className="text-left py-3 px-4 font-semibold text-plum">
                Dillinger
              </th>
              <th className="text-left py-3 pl-4 font-semibold">Markdown Live Preview</th>
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
          <li>You manage more than one document and need persistence between sessions</li>
          <li>You sync to GitHub, Dropbox, Google Drive, OneDrive, or Bitbucket</li>
          <li>You want the VS Code editing experience with syntax highlighting</li>
          <li>You use Vim or Emacs keybindings</li>
          <li>You need HTML export alongside PDF</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose Markdown Live Preview</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You need a quick paste-and-render scratchpad with zero setup</li>
          <li>You want an open-source tool you can self-host or audit</li>
          <li>You only render one snippet at a time and do not need persistence</li>
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
