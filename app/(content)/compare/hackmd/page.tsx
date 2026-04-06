import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dillinger vs HackMD",
  description:
    "Compare Dillinger and HackMD: features, collaboration, pricing, and use cases. Dillinger focuses on individual productivity, HackMD on real-time collaboration.",
  alternates: { canonical: "https://dillinger.io/compare/hackmd" },
};

const COMPARISON = [
  { feature: "Price", dillinger: "Free", competitor: "Free (paid tiers)" },
  { feature: "Signup required", dillinger: "No", competitor: "Yes" },
  { feature: "Real-time collaboration", dillinger: "No", competitor: "Yes" },
  { feature: "Editor engine", dillinger: "Monaco (VS Code)", competitor: "CodeMirror" },
  { feature: "Live preview", dillinger: "Side-by-side", competitor: "Split or unified" },
  { feature: "GitHub sync", dillinger: "Yes", competitor: "Yes (paid)" },
  { feature: "Dropbox sync", dillinger: "Yes", competitor: "No" },
  { feature: "Google Drive sync", dillinger: "Yes", competitor: "No" },
  { feature: "OneDrive sync", dillinger: "Yes", competitor: "No" },
  { feature: "PDF export", dillinger: "Yes", competitor: "Yes (paid)" },
  { feature: "Vim keybindings", dillinger: "Yes", competitor: "Yes" },
  { feature: "Zen / focus mode", dillinger: "Yes", competitor: "No" },
  { feature: "Data storage", dillinger: "Browser (private)", competitor: "Server (cloud)" },
  { feature: "Dark mode", dillinger: "Yes", competitor: "Yes" },
  { feature: "Slide presentations", dillinger: "No", competitor: "Yes" },
  { feature: "AI-ready workflow", dillinger: "Yes", competitor: "No" },
];

export default function HackMDCompare() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
        Comparison
      </p>
      <h1 className="text-4xl font-bold mb-4">Dillinger vs HackMD</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        HackMD is built for teams and real-time collaboration. Dillinger is
        built for individuals who want zero-friction markdown editing with
        cloud sync and no account required.
      </p>

      <div className="overflow-x-auto mb-12">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light">
              <th className="text-left py-3 pr-4 font-semibold">Feature</th>
              <th className="text-left py-3 px-4 font-semibold text-plum">
                Dillinger
              </th>
              <th className="text-left py-3 pl-4 font-semibold">HackMD</th>
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
          <li>You write alone and want zero setup — no account, no login</li>
          <li>You need to sync with Dropbox, Google Drive, or OneDrive</li>
          <li>Privacy matters — your documents stay in your browser, not on a server</li>
          <li>You want the VS Code editing experience with Monaco</li>
          <li>You are building AI/LLM workflows and need markdown-native tools</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">When to choose HackMD</h2>
        <ul className="space-y-3 text-text-muted">
          <li>You need real-time collaboration with team members</li>
          <li>You want to create slide presentations from markdown</li>
          <li>You need server-side storage with team workspaces</li>
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
