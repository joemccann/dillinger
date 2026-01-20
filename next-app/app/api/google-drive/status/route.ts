import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("google_drive_token");

    console.log("Google Drive status check - cookie exists:", !!tokenCookie);

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);
    console.log("Google Drive token parsed, checking with API...");

    // Verify token is still valid by calling userinfo
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    console.log("Google Drive API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Drive API error:", response.status, errorText);
      // Token expired or invalid
      return NextResponse.json({ connected: false });
    }

    const userInfo = await response.json();
    console.log("Google Drive connected successfully, user:", userInfo.email);

    return NextResponse.json({
      connected: true,
      email: userInfo.email,
    });
  } catch (error) {
    console.error("Google Drive status error:", error);
    return NextResponse.json({ connected: false });
  }
}
