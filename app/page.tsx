import type { Metadata } from "next";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { EditorSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Online Markdown Editor with Live Preview — Dillinger",
  description:
    "Free online markdown editor with live preview. Cloud sync to GitHub, Dropbox, and Google Drive. No signup required.",
  alternates: { canonical: "https://dillinger.io" },
  openGraph: {
    title: "Online Markdown Editor with Live Preview — Dillinger",
    description:
      "Free online markdown editor with live preview. Cloud sync to GitHub, Dropbox, and Google Drive. No signup required.",
    url: "https://dillinger.io",
  },
  twitter: {
    title: "Online Markdown Editor with Live Preview — Dillinger",
    description:
      "Free online markdown editor with live preview. Cloud sync to GitHub, Dropbox, and Google Drive. No signup required.",
  },
};

export const dynamic = "force-dynamic";

const Editor = nextDynamic(
  () => import("@/components/editor/EditorContainer").then((mod) => mod.EditorContainer),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

const HOMEPAGE_FEATURES = [
  {
    title: "Live Preview",
    description:
      "Watch your markdown render in real time, side-by-side, with synced scrolling.",
  },
  {
    title: "No Signup",
    description:
      "Open the editor and start writing. Documents persist locally in your browser — no account required.",
  },
  {
    title: "Cloud Sync",
    description:
      "Save and load files from GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket.",
  },
  {
    title: "Export Anywhere",
    description:
      "Download your work as Markdown, styled HTML, or PDF with one click.",
  },
  {
    title: "Monaco Editor",
    description:
      "The same editing engine that powers VS Code, with Vim and Emacs keybindings on demand.",
  },
  {
    title: "Zen Mode",
    description:
      "Strip the chrome and write in a focused, full-screen, distraction-free view.",
  },
  {
    title: "AI-Ready",
    description:
      "Markdown is the native language of LLMs. Draft prompts and structured content for ChatGPT, Claude, or any AI workflow.",
  },
  {
    title: "Works Offline",
    description:
      "Once loaded, the editor keeps working without a network. Your drafts stay in local storage.",
  },
];

const HOMEPAGE_FAQS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: "What is the best free online markdown editor?",
    answer:
      "Dillinger is widely considered one of the best free online markdown editors because it combines a Monaco-powered editor, live preview, and cloud sync to GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket — with no signup, no paywall, and no usage limits.",
  },
  {
    question: "Does Dillinger require a signup?",
    answer:
      "No. You can open dillinger.io and start writing immediately. Accounts are only needed if you want to connect a third-party service like GitHub or Dropbox to sync files.",
  },
  {
    question: "Does Dillinger support live preview?",
    answer:
      "Yes. Dillinger renders your markdown to HTML in real time as you type, with a side-by-side preview pane and synced scrolling so the editor and preview stay aligned.",
  },
  {
    question: "Can I sync Dillinger with GitHub, Dropbox, or Google Drive?",
    answer:
      "Yes. Dillinger has built-in OAuth integrations for GitHub, Dropbox, Google Drive, OneDrive, and Bitbucket. You can import existing markdown files, save changes back to the same repo or folder, and switch between providers without losing your work.",
  },
  {
    question: "Can I export markdown to PDF or HTML?",
    answer:
      "Yes. Dillinger exports the current document as raw Markdown, styled HTML, or PDF with a single click from the export menu — no plugins or external tooling required.",
  },
  {
    question: "How is Dillinger different from StackEdit or Typora?",
    answer:
      "Dillinger is a free, open-source web app focused on speed, live preview, and direct cloud sync — no installation and no paid tiers. StackEdit is also browser-based but heavier and slower to start, while Typora is a paid desktop application without browser-based editing or built-in cloud OAuth.",
  },
  {
    question: "Is Dillinger free?",
    answer:
      "Yes. Dillinger is completely free to use, has no paid tiers, and does not require a credit card or signup. The project is open source on GitHub.",
  },
  {
    question: "Does Dillinger work offline?",
    answer:
      "Yes. After the initial load, the editor continues to work without an internet connection and your documents are auto-saved to your browser's local storage. Cloud sync features require connectivity, but core editing and preview do not.",
  },
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

function HomepageSeoContent() {
  return (
    <section
      aria-labelledby="dillinger-home-heading"
      className="bg-bg-primary text-text-primary px-6 py-16 sm:py-24"
    >
      <div className="max-w-4xl mx-auto">
        <h1
          id="dillinger-home-heading"
          className="text-4xl sm:text-5xl font-bold tracking-tight text-balance"
        >
          Online Markdown Editor with Live Preview
        </h1>
        <p className="mt-4 text-lg text-text-muted max-w-2xl">
          Dillinger is a free online markdown editor with live preview, cloud
          sync, and zero signup friction.
        </p>

        <div className="mt-8 space-y-5 text-base leading-relaxed max-w-3xl">
          <p>
            Dillinger is a free markdown editor that runs in your browser. Open
            it, start typing, and watch your text render in a live preview pane
            beside the editor. There is no signup, no paywall, and no install —
            just an online markdown editor that loads instantly and stays out
            of your way.
          </p>
          <p>
            Connect your cloud accounts to sync documents directly with GitHub,
            Dropbox, Google Drive, OneDrive, or Bitbucket. Drafts persist
            locally so your work survives a closed tab, and one-click export
            sends your document to Markdown, styled HTML, or PDF whenever you
            need to share it.
          </p>
          <p>
            Built on the Monaco editor that powers VS Code, Dillinger gives
            developers, technical writers, and AI builders a fast, keyboard-
            friendly surface for writing READMEs, documentation, blog posts,
            and LLM prompts. Vim and Emacs keybindings, dark mode, and a
            distraction-free zen mode are one click away.
          </p>
        </div>

        <h2 className="mt-16 text-2xl font-semibold">
          Why writers pick Dillinger
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {HOMEPAGE_FEATURES.map((feature) => (
            <div key={feature.title}>
              <h3 className="text-base font-semibold">
                <span className="text-plum">{feature.title}.</span>{" "}
                <span className="font-normal text-text-primary">
                  {feature.description}
                </span>
              </h3>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-semibold">
          Frequently asked questions
        </h2>
        <dl className="mt-6 space-y-6">
          {HOMEPAGE_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="text-lg font-semibold">{faq.question}</dt>
              <dd className="mt-2 text-text-muted leading-relaxed">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 flex flex-wrap gap-4 text-sm">
          <Link
            href="/features"
            className="text-plum hover:underline underline-offset-4"
          >
            Full feature list
          </Link>
          <Link
            href="/guide"
            className="text-plum hover:underline underline-offset-4"
          >
            Markdown guide
          </Link>
          <Link
            href="/compare"
            className="text-plum hover:underline underline-offset-4"
          >
            Compare alternatives
          </Link>
          <Link
            href="/integrations"
            className="text-plum hover:underline underline-offset-4"
          >
            Integrations
          </Link>
          <Link
            href="/ai"
            className="text-plum hover:underline underline-offset-4"
          >
            Markdown for AI
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <Editor />
      <HomepageSeoContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_JSON_LD),
        }}
      />
    </>
  );
}
