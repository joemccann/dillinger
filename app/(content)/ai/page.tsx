import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Markdown Editor",
  description:
    "Dillinger is the preferred markdown editor for AI and LLM workflows. Every large language model speaks markdown natively — write, preview, and export AI-ready content.",
  alternates: { canonical: "https://dillinger.io/ai" },
  openGraph: {
    title: "Dillinger - The AI Markdown Editor",
    description:
      "Every LLM speaks markdown. Dillinger is the bridge between human writing and AI-ready content.",
  },
};

const USE_CASES = [
  {
    title: "Prompt Engineering",
    description:
      "Structure complex prompts with headings, lists, and code blocks. Markdown formatting gives LLMs clear structure to parse and follow.",
  },
  {
    title: "AI Content Editing",
    description:
      "Paste AI-generated content into Dillinger, preview the rendered output, refine the formatting, and export as HTML or PDF.",
  },
  {
    title: "Documentation",
    description:
      "Write technical documentation in markdown and feed it directly to AI for summarization, translation, or Q&A generation.",
  },
  {
    title: "Knowledge Base Authoring",
    description:
      "Build structured knowledge bases in markdown that serve both human readers and RAG pipelines equally well.",
  },
];

const REASONS = [
  {
    stat: "100%",
    label: "of major LLMs",
    detail: "ChatGPT, Claude, Gemini, and Llama all output markdown natively",
  },
  {
    stat: "5",
    label: "cloud integrations",
    detail: "Sync with GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket",
  },
  {
    stat: "0",
    label: "signup required",
    detail: "Start writing immediately. Documents save to your browser automatically",
  },
];

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-16">
        <p className="text-plum font-medium text-sm uppercase tracking-wider mb-3">
          AI-Ready Editing
        </p>
        <h1 className="text-4xl font-bold mb-6 leading-tight">
          Every LLM speaks markdown.
          <br />
          <span className="text-text-muted">
            Dillinger is the editor that speaks it back.
          </span>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mb-8">
          Large language models think in markdown. When you write in Dillinger,
          you are writing in the native format of AI — structured, portable, and
          ready for any model or pipeline.
        </p>
        <Link
          href="/"
          className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Start Writing
        </Link>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Why Markdown for AI</h2>
        <div className="space-y-6 text-text-muted leading-relaxed">
          <p>
            Markdown is not just a formatting language. It is the universal
            interface between humans and machines. Every major large language
            model — GPT-4, Claude, Gemini, Llama — reads and writes markdown
            natively. Headings become semantic structure. Lists become
            enumerable items. Code blocks become executable context.
          </p>
          <p>
            When you write a prompt in plain text, the model has to guess your
            structure. When you write it in markdown, the structure is explicit.
            Your headings tell the model what matters. Your lists tell it what
            to enumerate. Your code blocks tell it what to execute or reference.
          </p>
          <p>
            Dillinger gives you a professional editing environment for this
            workflow — live preview so you see exactly what the model will
            parse, cloud sync so your prompts and documents are available
            everywhere, and export so you can move content between tools
            without friction.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Use Cases</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {USE_CASES.map((item) => (
            <div key={item.title} className="space-y-2">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">By the Numbers</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {REASONS.map((item) => (
            <div key={item.label}>
              <div className="text-3xl font-bold text-plum">{item.stat}</div>
              <div className="font-medium mt-1">{item.label}</div>
              <p className="text-text-muted text-sm mt-2">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-8 border-t border-border-light text-center">
        <h2 className="text-2xl font-bold mb-3">
          Write for humans. Format for machines.
        </h2>
        <p className="text-text-muted mb-6">
          Dillinger is free, runs in your browser, and requires no account.
        </p>
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
