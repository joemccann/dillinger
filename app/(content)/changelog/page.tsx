import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "See what is new in Dillinger. Release notes, feature updates, and improvements to the online markdown editor.",
  alternates: { canonical: "https://dillinger.io/changelog" },
};

const RELEASES = [
  {
    version: "0.1.5",
    date: "April 2026",
    title: "SEO and content pages",
    changes: [
      "Added Features, AI, and Markdown Guide content pages",
      "Implemented Open Graph and Twitter Card meta tags",
      "Added JSON-LD structured data (WebApplication schema)",
      "Generated dynamic OG image",
      "Created XML sitemap",
    ],
  },
  {
    version: "0.1.4",
    date: "April 2026",
    title: "Design system, animations, and polish",
    changes: [
      "Established design system with .impeccable.md design context",
      "Added smooth sidebar slide and accordion animations",
      "Added settings panel slide transition",
      "Added zen mode crossfade and toast exit animations",
      "Added button press feedback across all interactive elements",
      "Added save status indicator (Saved/Unsaved) in title bar",
      "Added keyboard shortcuts modal (press ? to open)",
      "Added tooltips to all navbar icon buttons",
      "Improved typography: title bar, preview headings with bottom borders",
      "Added visual separation between editor and preview panes",
      "Added beforeunload warning for unsaved changes",
      "Responsive sidebar with mobile overlay and backdrop",
      "Preview pane hidden on mobile for full-width editing",
      "Replaced default welcome document with clean markdown showcase",
      "Added fade-in animation for export dropdown",
      "Collapsed empty ad bar when no ads load",
      "Added preview empty state placeholder",
      "Added reduced motion support (prefers-reduced-motion)",
      "Added motion design tokens to Tailwind config",
    ],
  },
  {
    version: "0.1.3",
    date: "March 2026",
    title: "Performance and testing",
    changes: [
      "Optimized React rendering and async waterfalls",
      "Improved bundle size with tree-shaking",
      "Added comprehensive test suite (Vitest + Playwright)",
      "Addressed react-doctor diagnostics across codebase",
    ],
  },
  {
    version: "0.1.0",
    date: "January 2026",
    title: "Next.js migration",
    changes: [
      "Migrated from Angular/Express to Next.js 14 with App Router",
      "Monaco Editor integration with Vim/Emacs keybindings",
      "Live markdown preview with scroll sync",
      "Cloud integrations: GitHub, Dropbox, Google Drive, OneDrive, Bitbucket",
      "Export to Markdown, styled HTML, and PDF",
      "Drag-and-drop file import",
      "Image paste from clipboard",
      "Auto-save to localStorage",
      "Dark mode / night mode",
      "Zen mode for distraction-free writing",
      "Zustand state management with persistence",
      "DOMPurify XSS sanitization",
      "KaTeX math rendering",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Changelog</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        What is new in Dillinger. All notable changes, features, and fixes.
      </p>

      <div className="space-y-12">
        {RELEASES.map((release) => (
          <section
            key={release.version}
            className="border-b border-border-light pb-12 last:border-0"
          >
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="text-2xl font-bold">v{release.version}</h2>
              <span className="text-text-muted text-sm">{release.date}</span>
            </div>
            <p className="text-text-muted mb-4">{release.title}</p>
            <ul className="space-y-2">
              {release.changes.map((change) => (
                <li key={change} className="flex items-start gap-2 text-text-muted">
                  <span className="text-plum mt-0.5 shrink-0">-</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border-light text-center">
        <p className="text-text-muted mb-4">
          Dillinger is open source and actively maintained.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open the Editor
          </Link>
          <a
            href="https://github.com/joemccann/dillinger"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
