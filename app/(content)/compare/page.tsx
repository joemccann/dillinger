import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compare Markdown Editors",
  description:
    "See how Dillinger compares to other online markdown editors like StackEdit and HackMD. Feature comparison, pricing, and workflow analysis.",
  alternates: { canonical: "https://dillinger.io/compare" },
};

const COMPETITORS = [
  {
    name: "StackEdit",
    slug: "stackedit",
    tagline: "Both are browser-based markdown editors — but Dillinger is faster to start, requires no account, and supports more cloud providers.",
  },
  {
    name: "HackMD",
    slug: "hackmd",
    tagline: "HackMD focuses on real-time collaboration. Dillinger focuses on individual productivity with zero friction.",
  },
];

export default function ComparePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Compare Markdown Editors</h1>
      <p className="text-text-muted text-lg mb-12 max-w-2xl">
        Choosing a markdown editor depends on your workflow. Here is how
        Dillinger compares to popular alternatives.
      </p>

      <div className="space-y-6">
        {COMPETITORS.map((comp) => (
          <Link
            key={comp.slug}
            href={`/compare/${comp.slug}`}
            className="block border border-border-light rounded-lg p-6 hover:border-plum transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">
              Dillinger vs {comp.name}
            </h2>
            <p className="text-text-muted">{comp.tagline}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-border-light text-center">
        <p className="text-text-muted mb-4">
          Ready to try Dillinger? No signup required.
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
