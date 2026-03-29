export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("bitbucket_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bitbucket unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink Bitbucket" },
      { status: 500 }
    );
  }
}
