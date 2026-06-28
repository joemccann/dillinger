import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Markdown Viewer — Open & Render .md Files Online",
  description:
    "Free online Markdown viewer. Open, render, and preview any .md file in your browser instantly. Drag and drop or paste — GitHub-flavored Markdown, no install or signup.",
  alternates: { canonical: "https://dillinger.io/markdown-viewer" },
};

const FAQ = [
  {
    question: "How do I open a .md file in a browser?",
    answer:
      "Open Dillinger, then drag your .md file onto the editor pane or paste its contents. The rendered output appears instantly in the live preview pane next to it. There is nothing to install — it runs entirely in your browser.",
  },
  {
    question: "Is the Markdown viewer free?",
    answer:
      "Yes. Dillinger is a completely free online Markdown viewer and editor. There is no signup, no account, and no paywall. Open it, view your file, and close the tab when you are done.",
  },
  {
    question: "Does it support GitHub-flavored Markdown?",
    answer:
      "Yes. Dillinger renders GitHub-flavored Markdown (GFM), including tables, task lists, fenced code blocks with syntax highlighting, strikethrough, and autolinks, so README files and docs look the way they do on GitHub.",
  },
  {
    question: "Can I view the rendered HTML or export it?",
    answer:
      "Yes. You can export the rendered output as HTML or PDF, or use your browser's print dialog to save the styled preview to PDF. The viewer also lets you copy the generated HTML directly.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Rendering happens locally in your browser. Your Markdown is parsed and previewed client-side, so a document you simply view or paste never has to leave your machine.",
  },
  {
    question: "Do I need to install anything to render Markdown?",
    answer:
      "No installation is required. Dillinger is a web app — open the page in any modern browser and you have a full Markdown renderer with live preview ready to use.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function MarkdownViewerPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-4xl font-bold mb-4">Markdown Viewer</h1>
      <p className="text-text-muted text-lg mb-4 max-w-2xl">
        A free online Markdown viewer that opens and renders any{" "}
        <code className="bg-bg-highlight text-icon-default rounded px-1.5 py-0.5 text-base font-mono">
          .md
        </code>{" "}
        file directly in your browser. Drop in a file or paste your text and see
        a clean, formatted preview instantly — no install, no signup.
      </p>
      <Link
        href="/"
        className="inline-block text-plum hover:underline text-sm font-medium mb-12"
      >
        Open the viewer and render your Markdown
      </Link>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-3">
            View and render a .md file in your browser
          </h2>
          <p className="text-text-muted mb-4">
            Markdown is plain text on disk, so a raw{" "}
            <code className="bg-bg-highlight text-icon-default rounded px-1.5 py-0.5 text-sm font-mono">
              .md
            </code>{" "}
            file shows hash symbols, asterisks, and pipe characters instead of
            formatted headings, bold text, and tables. A Markdown viewer parses
            that syntax and renders it the way it is meant to be read. Open
            Dillinger, drag your file onto the editor, and the right-hand preview
            pane renders the document — headings become headings, lists become
            lists, and code blocks gain syntax highlighting.
          </p>
          <p className="text-text-muted">
            Because everything runs client-side, there is no upload step and no
            waiting. The moment your file lands in the editor, the rendered view
            is ready to read, scroll, and copy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Drag and drop or paste to preview instantly
          </h2>
          <p className="text-text-muted mb-4">
            There are two fast ways to view Markdown. Drag a{" "}
            <code className="bg-bg-highlight text-icon-default rounded px-1.5 py-0.5 text-sm font-mono">
              .md
            </code>{" "}
            file from your desktop straight onto the editor pane, or copy raw
            Markdown from anywhere — a GitHub README, a chat message, a docs
            snippet — and paste it in. Either way, the preview updates the
            instant the content lands.
          </p>
          <pre className="bg-bg-highlight text-icon-default rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <code>{`# Project Title

A short **description** of what this does.

## Features
- Live preview
- GitHub-flavored Markdown
- Export to HTML or PDF

\`\`\`bash
npm install dillinger
\`\`\``}</code>
          </pre>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            GitHub-flavored Markdown support
          </h2>
          <p className="text-text-muted mb-4">
            Most Markdown you encounter in the wild is GitHub-flavored Markdown
            (GFM), and Dillinger renders it faithfully. That means tables with
            aligned columns, task lists with checkable boxes, fenced code blocks
            with language-aware syntax highlighting, strikethrough, autolinked
            URLs, and footnotes all display correctly. If a README looks right on
            GitHub, it will look right here — which makes the viewer ideal for
            previewing project documentation before you commit it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Live preview that updates as you type
          </h2>
          <p className="text-text-muted mb-4">
            Dillinger is more than a static renderer. The editor and preview sit
            side by side, and the rendered output updates in real time as you
            type or edit. View a file first, then fix a typo, restructure a list,
            or tweak a heading and watch the formatted result change immediately.
            It is the difference between viewing Markdown and working with it —
            you get both in one pane.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            Export or print the rendered output
          </h2>
          <p className="text-text-muted mb-4">
            Viewing is only the first step. Once your document is rendered you
            can export it as clean HTML or as a PDF, or open your browser&apos;s
            print dialog to save the styled preview. This makes Dillinger useful
            for turning a raw{" "}
            <code className="bg-bg-highlight text-icon-default rounded px-1.5 py-0.5 text-sm font-mono">
              .md
            </code>{" "}
            file into a shareable, polished document without copying the output
            into another tool.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">
            No install, no signup, no friction
          </h2>
          <p className="text-text-muted">
            You do not need to install an editor, add a browser extension, or
            create an account to read a Markdown file. Dillinger is a web app —
            open the page, render your content, and you are done. Rendering
            happens locally in your browser, so a document you simply view never
            has to leave your machine.
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border-light">
        <h2 className="text-2xl font-bold mb-6">Frequently asked questions</h2>
        <div className="space-y-6">
          {FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
              <p className="text-text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-border-light">
        <h2 className="text-2xl font-bold mb-3">Render your Markdown now</h2>
        <p className="text-text-muted mb-6">
          Open the editor, drop in a file or paste your text, and see the
          formatted preview instantly. Free, no signup required.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open the Editor
          </Link>
          <Link
            href="/guide"
            className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
          >
            Markdown Syntax Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
