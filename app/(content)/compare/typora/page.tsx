import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dillinger vs Typora",
  description:
    "Compare Dillinger (free web-based markdown editor with cloud sync) and Typora ($14.99 desktop WYSIWYG editor). See which fits your writing workflow.",
  alternates: { canonical: "https://dillinger.io/compare/typora" },
};

const COMPARISON = [
  { feature: "Price", dillinger: "Free", competitor: "$14.99 (one-time)" },
  { feature: "Platform", dillinger: "Web (any browser)", competitor: "Desktop (macOS, Windows, Linux)" },
  { feature: "Signup required", dillinger: "No", competitor: "No (license key)" },
  { feature: "Editor model", dillinger: "Side-by-side preview", competitor: "Seamless WYSIWYG" },
  { feature: "Editor engine", dillinger: "Monaco (VS Code)", competitor: "Custom WYSIWYG" },
  { feature: "GitHub sync", dillinger: "Yes", competitor: "No" },
  { feature: "Dropbox sync", dillinger: "Yes", competitor: "Folder-based only" },
  { feature: "Google Drive sync", dillinger: "Yes", competitor: "Folder-based only" },
  { feature: "OneDrive sync", dillinger: "Yes", competitor: "Folder-based only" },
  { feature: "Bitbucket sync", dillinger: "Yes", competitor: "No" },
  { feature: "PDF export", dillinger: "Yes", competitor: "Yes" },
  { feature: "HTML export", dillinger: "Yes", competitor: "Yes" },
  { feature: "DOCX / Word export", dillinger: "No", competitor: "Yes" },
  { feature: "LaTeX / EPUB export", dillinger: "No", competitor: "Yes" },
  { feature: "Math (LaTeX / MathJax)", dillinger: "Yes", competitor: "Yes" },
  { feature: "Mermaid diagrams", dillinger: "No", competitor: "Yes" },
  { feature: "Multiple documents", dillinger: "Yes", competitor: "Yes (file tree)" },
  { feature: "Themes", dillinger: "Light / dark", competitor: "Fully customizable (CSS)" },
  { feature: "Works offline", dillinger: "Yes (after first load)", competitor: "Yes (native app)" },
  { feature: "Install required", dillinger: "No", competitor: "Yes" },
];

export default function TyporaCompare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Comparison
      </p>
      <h1 className="text-4xl font-bold mb-4">Dillinger vs Typora</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Typora is the most polished desktop markdown experience — a paid native
        app with seamless WYSIWYG editing. Dillinger is the most polished
        web-based markdown experience — free, no install, with built-in cloud
        sync. Many writers use both.
      </p>

      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 pr-4 font-semibold">Feature</th>
              <th className="text-left py-3 px-4 font-semibold text-plum">
                Dillinger
              </th>
              <th className="text-left py-3 pl-4 font-semibold">Typora</th>
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
          <li>You want to start writing immediately in the browser — no install, no purchase</li>
          <li>You sync files between devices through GitHub, Dropbox, Google Drive, OneDrive, or Bitbucket</li>
          <li>You prefer a side-by-side editor and live preview over WYSIWYG</li>
          <li>You like the VS Code editing experience with Vim or Emacs keybindings</li>
          <li>You work across machines that you cannot install software on</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose Typora</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You write long-form content offline and want a true desktop app</li>
          <li>You prefer seamless WYSIWYG over a separate preview pane</li>
          <li>You need DOCX, EPUB, OpenOffice, or LaTeX export</li>
          <li>You want Mermaid diagram support and deep CSS theme customization</li>
          <li>You are happy to pay $14.99 once for a polished native experience</li>
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
