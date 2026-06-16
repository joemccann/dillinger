import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApiKeyList } from "@/components/settings/ApiKeyList";
import { CreateApiKeyForm } from "@/components/settings/CreateApiKeyForm";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your Dillinger API keys.",
};

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">API Keys</h1>
      <p className="text-text-muted mb-8">
        Use API keys to authenticate with the Dillinger API, MCP server, or CLI.
      </p>

      <CreateApiKeyForm />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Active Keys</h2>
        <ApiKeyList initialKeys={keys} />
      </div>

      <div className="mt-12 p-4 bg-bg-highlight rounded-lg text-sm text-text-muted space-y-2">
        <p className="font-medium text-text-primary">Usage</p>
        <p>Pass your key as a Bearer token:</p>
        <code className="block bg-bg-sidebar text-icon-default px-3 py-2 rounded text-xs font-mono">
          curl -H &quot;Authorization: Bearer dk_...&quot;
          https://dillinger.io/api/v1/render
        </code>
        <p>Rate limit: 100 requests per hour per key.</p>
      </div>
    </div>
  );
}
