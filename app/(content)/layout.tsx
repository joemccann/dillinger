import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {};

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-bg-primary text-text-primary">
      <header className="h-14 bg-bg-navbar flex items-center px-6">
        <Link
          href="/"
          className="text-plum font-bold text-xl tracking-wide hover:opacity-80 transition-opacity"
        >
          DILLINGER
        </Link>
        <nav className="ml-auto flex items-center gap-6 text-sm text-text-invert">
          <Link href="/features" className="hover:text-plum transition-colors">
            Features
          </Link>
          <Link href="/ai" className="hover:text-plum transition-colors">
            AI
          </Link>
          <Link href="/guide" className="hover:text-plum transition-colors">
            Guide
          </Link>
          <Link
            href="/"
            className="bg-plum text-bg-sidebar px-4 py-1.5 rounded font-medium hover:opacity-90 transition-opacity"
          >
            Open Editor
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-bg-navbar text-text-muted text-sm py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Dillinger — The last Markdown editor you will ever need.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-text-invert transition-colors">
              Privacy
            </Link>
            <a
              href="https://github.com/joemccann/dillinger"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-invert transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
