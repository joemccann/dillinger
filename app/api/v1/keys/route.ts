export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { name = "Default" } = await request.json().catch(() => ({}));

  const activeCount = await prisma.apiKey.count({
    where: { userId: session.user.id, revokedAt: null },
  });

  if (activeCount >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 active API keys allowed. Revoke an existing key first." },
      { status: 400 }
    );
  }

  const { plaintext, hash, prefix } = generateApiKey();

  const key = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: String(name).slice(0, 64),
      keyHash: hash,
      keyPrefix: prefix,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    { key: { ...key, plaintext } },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
        Pragma: "no-cache",
      },
    }
  );
}
