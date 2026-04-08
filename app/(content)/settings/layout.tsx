import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex gap-8">
        <nav className="w-48 shrink-0 hidden sm:block">
          <h2 className="text-xs uppercase tracking-wider text-text-muted mb-4">
            Settings
          </h2>
          <Link
            href="/settings/api"
            className="block py-2 text-sm text-text-primary hover:text-plum transition-colors font-medium"
          >
            API Keys
          </Link>
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
