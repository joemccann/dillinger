import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("onedrive_token");

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // Verify token is still valid by calling Microsoft Graph API
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
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
      email: userInfo.mail || userInfo.userPrincipalName,
    });
  } catch (error) {
    console.error("OneDrive status error:", error);
    return NextResponse.json({ connected: false });
  }
}
