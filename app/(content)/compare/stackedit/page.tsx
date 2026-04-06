import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dillinger vs StackEdit",
  description:
    "Compare Dillinger and StackEdit: features, cloud sync, pricing, and developer experience. Both are free online markdown editors — see which fits your workflow.",
  alternates: { canonical: "https://dillinger.io/compare/stackedit" },
};

const COMPARISON = [
  { feature: "Price", dillinger: "Free", competitor: "Free (paid for teams)" },
  { feature: "Signup required", dillinger: "No", competitor: "Yes (Google account)" },
  { feature: "Editor engine", dillinger: "Monaco (VS Code)", competitor: "CodeMirror" },
  { feature: "Live preview", dillinger: "Side-by-side", competitor: "Side-by-side" },
  { feature: "GitHub sync", dillinger: "Yes", competitor: "Yes" },
  { feature: "Dropbox sync", dillinger: "Yes", competitor: "Yes" },
  { feature: "Google Drive sync", dillinger: "Yes", competitor: "Yes" },
  { feature: "OneDrive sync", dillinger: "Yes", competitor: "No" },
  { feature: "Bitbucket sync", dillinger: "Yes", competitor: "No" },
  { feature: "PDF export", dillinger: "Yes", competitor: "No" },
  { feature: "Vim keybindings", dillinger: "Yes", competitor: "No" },
  { feature: "Emacs keybindings", dillinger: "Yes", competitor: "No" },
  { feature: "Zen / focus mode", dillinger: "Yes", competitor: "No" },
  { feature: "KaTeX math", dillinger: "Yes", competitor: "Yes" },
  { feature: "Mermaid diagrams", dillinger: "No", competitor: "Yes" },
  { feature: "Offline support", dillinger: "Yes (localStorage)", competitor: "Yes (service worker)" },
  { feature: "Dark mode", dillinger: "Yes", competitor: "No" },
  { feature: "AI-ready workflow", dillinger: "Yes", competitor: "No" },
];

export default function StackEditCompare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Comparison
      </p>
      <h1 className="text-4xl font-bold mb-4">Dillinger vs StackEdit</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Both are free, browser-based markdown editors. Dillinger uses the Monaco
        editor (VS Code), supports more cloud providers, and requires no
        account to start writing.
      </p>

      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 pr-4 font-semibold">Feature</th>
              <th className="text-left py-3 px-4 font-semibold text-plum">
                Dillinger
              </th>
              <th className="text-left py-3 pl-4 font-semibold">StackEdit</th>
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
          <li>You want to start writing immediately without creating an account</li>
          <li>You need PDF export or Vim/Emacs keybindings</li>
          <li>You sync files to OneDrive or Bitbucket</li>
          <li>You prefer the VS Code editing experience (Monaco)</li>
          <li>You work with AI/LLM tools and need markdown-native formatting</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose StackEdit</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You need Mermaid diagram support</li>
          <li>You prefer service worker offline support over localStorage</li>
          <li>You need team collaboration features (paid plan)</li>
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
