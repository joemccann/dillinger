import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Dillinger's privacy policy. We do not require an account, we store your documents locally in your browser, and we do not sell your data.",
  alternates: { canonical: "https://dillinger.io/privacy" },
};

const LAST_UPDATED = "May 10, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-text-muted text-sm mb-12">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-10 text-text-muted leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">The short version</h2>
          <p>
            Dillinger is a browser-based markdown editor. You can use it without an
            account. Your documents are saved in your own browser&apos;s local storage
            — not on our servers. We do not sell your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">What we store</h2>
          <p>
            <strong className="text-text-primary">In your browser:</strong> your
            documents, editor settings (theme, keybindings, preview mode), and
            recent files. This data lives in <code>localStorage</code> on the
            device you are using. Clear your browser storage and it is gone.
          </p>
          <p>
            <strong className="text-text-primary">On our servers:</strong> nothing
            tied to your identity. We do not maintain user accounts and we do not
            persist your document contents.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Cloud integrations</h2>
          <p>
            If you connect Dillinger to GitHub, Dropbox, Google Drive, OneDrive,
            Bitbucket, or Medium, OAuth tokens are issued by those providers and
            held only for the duration of your session so we can read and write
            the specific files you ask us to. We do not browse your accounts in
            the background.
          </p>
          <p>
            Disconnecting is as simple as revoking access in that provider&apos;s
            settings. You can also clear your local browser storage to remove any
            session state on your end.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Analytics and ads</h2>
          <p>
            We use privacy-respecting analytics to understand aggregate usage of
            the site (page views, traffic sources). Dillinger may also display a
            single Carbon ad on the landing page; Carbon serves a contextual ad
            based on the page itself, not on your personal profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Exports and uploads</h2>
          <p>
            HTML and PDF exports are generated on demand by our server. The
            markdown you submit for export is processed transiently and is not
            retained after the response is returned.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Children</h2>
          <p>
            Dillinger is a general-audience tool and is not directed at children
            under 13.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Changes</h2>
          <p>
            If this policy changes in a way that affects how we handle your data,
            we will update the &quot;Last updated&quot; date above and, where
            appropriate, surface a notice in the editor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-text-primary">Contact</h2>
          <p>
            Questions? Open an issue at{" "}
            <a
              href="https://github.com/joemccann/dillinger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-plum hover:underline"
            >
              github.com/joemccann/dillinger
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border-light text-center">
        <Link
          href="/"
          className="inline-block bg-plum text-bg-sidebar px-6 py-3 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Back to the Editor
        </Link>
      </div>
    </div>
  );
}
