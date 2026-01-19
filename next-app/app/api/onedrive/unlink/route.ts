import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("onedrive_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OneDrive unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink OneDrive" },
      { status: 500 }
    );
  }
}
