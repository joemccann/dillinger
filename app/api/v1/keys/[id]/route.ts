export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  const key = await prisma.apiKey.findUnique({ where: { id } });

  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  if (key.revokedAt) {
    return NextResponse.json({ error: "API key already revoked" }, { status: 400 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
