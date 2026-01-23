export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("medium_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Medium unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink Medium" },
      { status: 500 }
    );
  }
}
