import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Markdown Guide",
  description:
    "Complete markdown syntax guide and cheat sheet. Learn headings, lists, links, images, code blocks, tables, and more with live examples in Dillinger.",
  alternates: { canonical: "https://dillinger.io/guide" },
};

const SECTIONS = [
  {
    title: "Headings",
    syntax: "# Heading 1\\n## Heading 2\\n### Heading 3",
    description:
      "Use hash symbols to create headings. One hash for the largest heading, up to six for the smallest.",
  },
  {
    title: "Text Formatting",
    syntax:
      "**bold** or __bold__\\n*italic* or _italic_\\n~~strikethrough~~\\n***bold italic***",
    description:
      "Wrap text in asterisks or underscores for emphasis. Double for bold, single for italic, tildes for strikethrough.",
  },
  {
    title: "Links",
    syntax:
      "[Link text](https://example.com)\\n[Link with title](https://example.com \"Title\")",
    description:
      "Square brackets for the display text, parentheses for the URL. Add a quoted string for a hover title.",
  },
  {
    title: "Images",
    syntax: "![Alt text](image-url.jpg)\\n![Alt text](image-url.jpg \"Title\")",
    description:
      "Same as links but with an exclamation mark prefix. Always include alt text for accessibility.",
  },
  {
    title: "Unordered Lists",
    syntax: "- Item one\\n- Item two\\n  - Nested item\\n  - Another nested",
    description:
      "Use dashes, asterisks, or plus signs. Indent with two spaces for nested lists.",
  },
  {
    title: "Ordered Lists",
    syntax: "1. First item\\n2. Second item\\n3. Third item",
    description:
      "Number followed by a period. The actual numbers do not matter — markdown will renumber automatically.",
  },
  {
    title: "Task Lists",
    syntax: "- [x] Completed task\\n- [ ] Incomplete task",
    description:
      "Add square brackets after the list marker. Use x for completed items.",
  },
  {
    title: "Blockquotes",
    syntax: "> This is a quote.\\n>\\n> It can span multiple lines.",
    description:
      "Prefix lines with a greater-than symbol. Nest by adding more symbols.",
  },
  {
    title: "Inline Code",
    syntax: "Use `backticks` for inline code.",
    description:
      "Wrap text in single backticks for inline code formatting.",
  },
  {
    title: "Code Blocks",
    syntax: "```javascript\\nconst x = 42;\\nconsole.log(x);\\n```",
    description:
      "Use triple backticks with an optional language identifier for syntax-highlighted code blocks.",
  },
  {
    title: "Tables",
    syntax:
      "| Header | Header |\\n|--------|--------|\\n| Cell   | Cell   |\\n| Cell   | Cell   |",
    description:
      "Use pipes and hyphens to create tables. Colons in the separator row control alignment.",
  },
  {
    title: "Horizontal Rules",
    syntax: "---\\n***\\n___",
    description:
      "Three or more hyphens, asterisks, or underscores on a line create a horizontal rule.",
  },
  {
    title: "Footnotes",
    syntax:
      "Text with a footnote[^1].\\n\\n[^1]: This is the footnote content.",
    description:
      "Reference footnotes with bracketed caret notation. Define them anywhere in the document.",
  },
  {
    title: "Math (KaTeX)",
    syntax: "Inline: $E = mc^2$\\n\\nBlock:\\n$$\\n\\\\sum_{i=1}^{n} i\\n$$",
    description:
      "Dillinger supports KaTeX math rendering. Use single dollars for inline, double for block equations.",
  },
];

export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Markdown Guide</h1>
      <p className="text-text-muted text-lg mb-4 max-w-2xl">
        A complete reference for markdown syntax. Every example works in
        Dillinger — open the editor and try them.
      </p>
      <Link
        href="/"
        className="inline-block text-plum hover:underline text-sm font-medium mb-12"
      >
        Open the Editor to try these examples
      </Link>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.title} id={section.title.toLowerCase().replace(/\s+/g, "-")}>
            <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
            <p className="text-text-muted mb-4">{section.description}</p>
            <pre className="bg-bg-highlight text-icon-default rounded-lg p-4 text-sm font-mono overflow-x-auto">
              <code>{section.syntax.replace(/\\n/g, "\n")}</code>
            </pre>
          </section>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-border-light">
        <h2 className="text-2xl font-bold mb-3">Try it live</h2>
        <p className="text-text-muted mb-6">
          Dillinger renders all of these formats in real time. Paste any example
          into the editor and see the preview instantly.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open the Editor
          </Link>
          <Link
            href="/features"
            className="inline-block border border-border-light px-6 py-3 rounded font-medium hover:bg-border-light/20 transition-colors"
          >
            See All Features
          </Link>
        </div>
      </div>
    </div>
  );
}
