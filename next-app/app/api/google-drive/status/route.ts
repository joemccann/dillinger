import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("google_drive_token");

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // Verify token is still valid by calling userinfo
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      // Token expired or invalid
      return NextResponse.json({ connected: false });
    }

    const userInfo = await response.json();

    return NextResponse.json({
      connected: true,
      email: userInfo.email,
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json({ connected: false });
  }
}
