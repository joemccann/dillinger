import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "README Editor — Write & Preview README.md Online",
  description:
    "Write and edit README.md files online with live preview. GitHub-flavored Markdown, badges, tables, and code blocks. Sync and export to GitHub. Free, no signup.",
  alternates: { canonical: "https://dillinger.io/readme-editor" },
};

const SNIPPETS = [
  {
    title: "Badges",
    description:
      "Status badges sit at the top of most READMEs to signal build health, version, and license at a glance. They are just images wrapped in links, so they render anywhere GitHub-flavored Markdown is supported.",
    markdown:
      "![Build](https://img.shields.io/badge/build-passing-brightgreen)\\n![License](https://img.shields.io/badge/license-MIT-blue)",
  },
  {
    title: "Installation code blocks",
    description:
      "Fenced code blocks with a language hint give readers copy-paste-ready commands and syntax-highlighted examples. This is the single most-used section in any good README.",
    markdown:
      "```bash\\nnpm install your-package\\nnpm run build\\n```",
  },
  {
    title: "Feature tables",
    description:
      "Tables are perfect for comparing plans, listing configuration options, or mapping commands to descriptions. Dillinger renders GitHub-flavored Markdown tables exactly as GitHub does.",
    markdown:
      "| Option   | Default | Description        |\\n|----------|---------|--------------------|\\n| `port`   | 3000    | Server port        |\\n| `silent` | false   | Suppress all logs  |",
  },
  {
    title: "Task lists",
    description:
      "Roadmap and contributing sections often use task lists to show what is done and what is planned. Check boxes render as interactive checkboxes on GitHub.",
    markdown: "- [x] Core API\\n- [x] Documentation\\n- [ ] CLI tool",
  },
];

const FAQ = [
  {
    question: "What is a README editor?",
    answer:
      "A README editor is a tool for writing and previewing the README.md file that introduces a software project. Dillinger lets you write the Markdown on one side and see a rendered preview on the other, so you know exactly how your README will look on GitHub before you publish it.",
  },
  {
    question: "Does Dillinger support GitHub-flavored Markdown?",
    answer:
      "Yes. Dillinger renders GitHub-flavored Markdown, including tables, task lists, fenced code blocks with syntax highlighting, strikethrough, and autolinked URLs, so your preview closely matches how the file will appear in a GitHub repository.",
  },
  {
    question: "Can I add badges and images to my README?",
    answer:
      "Absolutely. Badges are standard Markdown images, often from services like Shields.io, optionally wrapped in a link. Paste the badge Markdown at the top of your file and Dillinger renders it live alongside the rest of your content.",
  },
  {
    question: "Can I save my README directly to GitHub?",
    answer:
      "Yes. Connect your GitHub account and you can open a README.md from a repository, edit it with live preview, and save your changes back. You can also export the file to download a clean README.md to commit manually.",
  },
  {
    question: "Do I need to install anything or sign up?",
    answer:
      "No. Dillinger runs in your browser with no installation and no account required. You only authenticate if you choose to connect a cloud service such as GitHub for syncing files.",
  },
  {
    question: "Will the preview match what GitHub shows?",
    answer:
      "Dillinger uses a GitHub-flavored Markdown parser, so headings, tables, code blocks, and task lists render very close to GitHub's own rendering. Minor styling differences in fonts or spacing can exist, but the structure and formatting will match.",
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

export default function ReadmeEditorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <h1 className="text-4xl font-bold mb-4">README Editor</h1>
      <p className="text-text-muted text-lg mb-4 max-w-2xl">
        Write and preview your README.md online with live, side-by-side
        rendering. Dillinger speaks GitHub-flavored Markdown — badges, tables,
        code blocks, and task lists all render the way they will on GitHub. Free,
        no signup, and you can sync straight to your repository.
      </p>
      <Link
        href="/"
        className="inline-block text-plum hover:underline text-sm font-medium mb-12"
      >
        Open the Editor to start your README
      </Link>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold mb-3">Write and edit README.md with live preview</h2>
          <p className="text-text-muted mb-4">
            Your README is the front door to your project. It is the first thing
            a developer reads when they land on your repository, and a clear,
            well-formatted one is the difference between a project people adopt
            and one they skip. Dillinger turns writing that file into a fast,
            visual task: type Markdown on the left, watch the rendered README
            appear on the right, and adjust until it reads exactly the way you
            want.
          </p>
          <p className="text-text-muted mb-4">
            Because the preview is live, you never have to commit, refresh, and
            squint at a half-broken table. Headings, lists, links, and images
            update as you type, so the structure of your document is always
            visible.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">GitHub-flavored Markdown, rendered faithfully</h2>
          <p className="text-text-muted mb-4">
            GitHub uses an extended dialect of Markdown known as GitHub-flavored
            Markdown (GFM). It adds tables, task lists, fenced code blocks with
            syntax highlighting, strikethrough, and automatic linking of bare
            URLs on top of standard CommonMark. Dillinger renders all of these,
            so the preview you see is a close match for what visitors will see on
            your repository page.
          </p>
          <p className="text-text-muted mb-4">
            That fidelity matters most for the elements that are easy to get
            wrong in plain text — especially tables, where a single misplaced
            pipe can break the layout. Seeing the rendered result immediately
            saves you a round trip to GitHub.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Badges, tables, and code blocks</h2>
          <p className="text-text-muted mb-6">
            A strong README leans on a handful of recurring building blocks. Here
            are the ones you will reach for most, with copy-ready Markdown you can
            drop into Dillinger.
          </p>
          <div className="space-y-10">
            {SNIPPETS.map((snippet) => (
              <div key={snippet.title}>
                <h3 className="text-xl font-semibold mb-2">{snippet.title}</h3>
                <p className="text-text-muted mb-4">{snippet.description}</p>
                <pre className="bg-bg-highlight text-icon-default rounded-lg p-4 text-sm font-mono overflow-x-auto">
                  <code>{snippet.markdown.replace(/\\n/g, "\n")}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-3">Sync and export to GitHub</h2>
          <p className="text-text-muted mb-4">
            When your README is ready, you do not have to copy and paste it
            anywhere. Connect your GitHub account and Dillinger can open an
            existing README.md from any of your repositories, let you edit it with
            full live preview, and save the changes back. It is a quick way to
            polish documentation without leaving your browser or wrestling with a
            terminal.
          </p>
          <p className="text-text-muted mb-4">
            Prefer to keep things manual? Export a clean{" "}
            <code className="bg-bg-highlight px-1 rounded">README.md</code> file
            and commit it yourself, or export to HTML or PDF when you need to
            share the documentation outside of GitHub. Your content is never
            locked in.
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border-light">
        <h2 className="text-2xl font-bold mb-3">Start your README now</h2>
        <p className="text-text-muted mb-6">
          Open Dillinger, write in GitHub-flavored Markdown, and preview your
          README.md live before you ship it. New to Markdown? The guide covers
          every syntax element you will need.
        </p>
        <div className="flex gap-4">
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
            Read the Markdown Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
