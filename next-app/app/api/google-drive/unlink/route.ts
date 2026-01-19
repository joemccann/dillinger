import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("google_drive_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Drive unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink Google Drive" },
      { status: 500 }
    );
  }
}
