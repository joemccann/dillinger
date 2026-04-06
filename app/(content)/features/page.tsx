import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore Dillinger's features: Monaco-powered editor, live preview, GitHub sync, Dropbox integration, PDF export, Vim keybindings, zen mode, and more.",
  alternates: { canonical: "https://dillinger.io/features" },
};

const FEATURES = [
  {
    title: "Monaco Editor",
    description:
      "The same editor that powers VS Code. Syntax highlighting, multiple cursors, find and replace, and intelligent autocompletion — all built in.",
  },
  {
    title: "Live Preview",
    description:
      "See your rendered markdown in real time as you type. Scroll sync keeps the editor and preview aligned, so you always know where you are.",
  },
  {
    title: "Cloud Sync",
    description:
      "Import and save files directly to GitHub, Dropbox, Google Drive, OneDrive, or Bitbucket. Your documents travel with you.",
  },
  {
    title: "Export Anywhere",
    description:
      "Export your work as Markdown, styled HTML, or PDF. One-click download, ready to share or publish.",
  },
  {
    title: "Zen Mode",
    description:
      "Strip away every distraction. Zen mode gives you a fullscreen, focused writing environment with nothing between you and your words.",
  },
  {
    title: "Vim and Emacs Keybindings",
    description:
      "Switch to Vim or Emacs keybinding mode in settings. Your muscle memory works here.",
  },
  {
    title: "Drag and Drop",
    description:
      "Drop markdown, HTML, or image files directly into the editor. Dillinger handles the conversion automatically.",
  },
  {
    title: "Dark Mode",
    description:
      "Easy on the eyes. Toggle night mode for comfortable editing in low-light environments.",
  },
  {
    title: "Auto Save",
    description:
      "Your documents persist automatically in your browser. No account required, no data on our servers.",
  },
  {
    title: "AI-Ready Formatting",
    description:
      "Markdown is the native language of large language models. Write in Dillinger, then feed your content directly to ChatGPT, Claude, or any LLM.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Features</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Everything you need to write, preview, and share markdown — nothing you
        do not.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="space-y-2">
            <h2 className="text-xl font-semibold">{feature.title}</h2>
            <p className="text-text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-border-light text-center">
        <p className="text-text-muted mb-4">Ready to start writing?</p>
        <Link
          href="/"
          className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Open the Editor
        </Link>
      </div>
    </div>
  );
}
