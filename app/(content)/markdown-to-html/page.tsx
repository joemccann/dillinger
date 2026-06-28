import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter — Free Online Tool",
  description:
    "Convert Markdown to clean, valid HTML instantly. Paste your Markdown, see live HTML preview, then copy or export. Free, no signup, runs in your browser.",
  alternates: { canonical: "https://dillinger.io/markdown-to-html" },
};

const CONVERSIONS = [
  {
    title: "Headings",
    markdown: "## Getting Started",
    html: '<h2 id="getting-started">Getting Started</h2>',
    description:
      "Each # level maps to a corresponding <h1> through <h6> tag. Dillinger also generates slugged id attributes so your headings double as anchor targets.",
  },
  {
    title: "Lists",
    markdown: "- First item\\n- Second item\\n  - Nested item",
    html: "<ul>\\n  <li>First item</li>\\n  <li>Second item\\n    <ul><li>Nested item</li></ul>\\n  </li>\\n</ul>",
    description:
      "Unordered lists become <ul>/<li> and ordered lists become <ol>/<li>. Nested lists are converted into properly nested child elements.",
  },
  {
    title: "Links and images",
    markdown: "[Docs](https://dillinger.io)\\n![Logo](/logo.png)",
    html: '<a href="https://dillinger.io">Docs</a>\\n<img src="/logo.png" alt="Logo">',
    description:
      "Inline and reference links become <a> tags, and images become <img> tags with the alt text preserved as the alt attribute.",
  },
  {
    title: "Code blocks",
    markdown: "```js\\nconst x = 42;\\n```",
    html: '<pre><code class="language-js">const x = 42;\\n</code></pre>',
    description:
      "Fenced code blocks become <pre><code> with a language-* class so syntax highlighters can color the output. Inline `code` becomes a <code> tag.",
  },
  {
    title: "Tables",
    markdown:
      "| Name | Role |\\n|------|------|\\n| Ada  | Lead |",
    html: "<table>\\n  <thead><tr><th>Name</th><th>Role</th></tr></thead>\\n  <tbody><tr><td>Ada</td><td>Lead</td></tr></tbody>\\n</table>",
    description:
      "GitHub-flavored Markdown tables are converted to full <table> markup with <thead>, <tbody>, and alignment styles derived from the separator row.",
  },
];

const FAQ = [
  {
    question: "How do I convert Markdown to HTML with Dillinger?",
    answer:
      "Open the editor, paste or type your Markdown on the left, and Dillinger renders the HTML preview on the right in real time. To get the raw HTML, use the export menu to download an .html file or copy the rendered markup directly.",
  },
  {
    question: "Is the Markdown to HTML conversion free?",
    answer:
      "Yes. Dillinger is completely free and requires no account or signup. The conversion runs in your browser, so you can convert as many documents as you like without limits.",
  },
  {
    question: "What Markdown elements get converted to HTML?",
    answer:
      "Headings, paragraphs, bold and italic text, ordered and unordered lists, task lists, links, images, blockquotes, inline code, fenced code blocks with language hints, horizontal rules, footnotes, and GitHub-flavored Markdown tables all convert to their standard HTML equivalents.",
  },
  {
    question: "Is the generated HTML clean and safe?",
    answer:
      "The output is standards-compliant HTML produced by markdown-it. Dillinger sanitizes rendered HTML with DOMPurify before displaying the preview, so the markup you copy is clean and free of injected scripts.",
  },
  {
    question: "Can I copy or export the HTML?",
    answer:
      "Yes. You can copy the rendered HTML to your clipboard or export the document as a standalone .html file. You can also export to PDF or download the original Markdown source.",
  },
  {
    question: "Does my Markdown leave my computer?",
    answer:
      "No. Markdown to HTML conversion happens locally in your browser. Your content is not uploaded to a server unless you explicitly connect a cloud integration like GitHub or Dropbox.",
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

export default function MarkdownToHtmlPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-4xl font-bold mb-4">Markdown to HTML Converter</h1>
      <p className="text-text-muted text-lg mb-4 max-w-2xl">
        Turn Markdown into clean, valid HTML in seconds. Paste your Markdown
        into Dillinger and watch the HTML render live — then copy it or export a
        standalone file. Free, no signup, and it runs right in your browser.
      </p>
      <Link
        href="/"
        className="inline-block text-plum hover:underline text-sm font-medium mb-12"
      >
        Open the Editor to convert your Markdown
      </Link>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-3">Convert Markdown to clean HTML</h2>
          <p className="text-text-muted mb-4">
            Markdown is a plain-text writing format, but browsers, email clients,
            and most publishing platforms speak HTML. A converter bridges the
            two: you write in the simple, readable Markdown syntax, and the tool
            produces the structured HTML tags the web actually renders. Dillinger
            uses the battle-tested markdown-it parser, the same engine trusted by
            countless documentation sites, to produce HTML that follows the
            CommonMark and GitHub-flavored Markdown specifications.
          </p>
          <p className="text-text-muted mb-4">
            Because the conversion is instant and live, there is no
            convert-and-wait step. As you type or paste, the right-hand preview
            updates in real time so you can see exactly how every heading, list,
            and code block will look once it becomes HTML.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">What gets converted</h2>
          <p className="text-text-muted mb-6">
            Every common Markdown element maps to a predictable HTML tag. Here is
            how the most-used pieces of Markdown translate into the output you can
            copy or export.
          </p>
          <div className="space-y-10">
            {CONVERSIONS.map((item) => (
              <div key={item.title}>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-text-muted mb-4">{item.description}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-2">Markdown</p>
                    <pre className="bg-bg-highlight text-icon-default rounded-lg p-4 text-sm font-mono overflow-x-auto">
                      <code>{item.markdown.replace(/\\n/g, "\n")}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">HTML</p>
                    <pre className="bg-bg-highlight text-icon-default rounded-lg p-4 text-sm font-mono overflow-x-auto">
                      <code>{item.html.replace(/\\n/g, "\n")}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Copy or export your HTML</h2>
          <p className="text-text-muted mb-4">
            Once the preview looks right, getting the HTML out is one click. Copy
            the rendered markup straight to your clipboard to paste into a CMS,
            an email template, or a static-site project. Prefer a file? Export a
            self-contained <code className="bg-bg-highlight px-1 rounded">.html</code>{" "}
            document you can open in any browser, or export to PDF when you need a
            polished, shareable artifact.
          </p>
          <p className="text-text-muted mb-4">
            You can also keep working in the original Markdown and re-export at
            any time — Dillinger never locks your content into a proprietary
            format. The Markdown source is always yours to download.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Live, private, no signup</h2>
          <p className="text-text-muted mb-4">
            There is nothing to install and no account to create. The conversion
            happens entirely in your browser, which means your draft stays on
            your machine unless you deliberately connect a cloud service. That
            makes Dillinger a good fit for sensitive notes, internal docs, and
            anything you would rather not upload to a third-party server just to
            see some HTML.
          </p>
          <p className="text-text-muted mb-4">
            Output is sanitized with DOMPurify before it reaches the preview, so
            the HTML you copy is clean and safe to drop into your own pages.
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border-light">
        <h2 className="text-2xl font-bold mb-3">Convert your Markdown now</h2>
        <p className="text-text-muted mb-6">
          Paste any Markdown into Dillinger and the HTML appears instantly. Copy
          it, export it, or keep editing — all in one place.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open the Editor
          </Link>
          <Link
            href="/markdown-viewer"
            className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
          >
            Open the Markdown Viewer
          </Link>
        </div>
      </div>
    </div>
  );
}
