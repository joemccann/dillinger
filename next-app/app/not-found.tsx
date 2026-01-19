import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary">
      <h1 className="text-4xl font-bold text-text-invert mb-4">404</h1>
      <p className="text-text-muted mb-6">Page not found</p>
      <Link
        href="/"
        className="bg-plum text-bg-sidebar px-6 py-2 rounded font-medium hover:opacity-90 transition-opacity"
      >
        Go Home
      </Link>
    </div>
  );
}
