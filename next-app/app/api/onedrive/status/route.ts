export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("onedrive_token");

    console.log("OneDrive status check - cookie exists:", !!tokenCookie);

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);
    console.log("OneDrive token parsed, checking with Microsoft Graph API...");

    // Verify token is still valid by calling Microsoft Graph API
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    console.log("Microsoft Graph API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Microsoft Graph API error:", response.status, errorText);
      // Token expired or invalid
      return NextResponse.json({ connected: false });
    }

    const userInfo = await response.json();
    console.log("OneDrive connected successfully, user:", userInfo.mail || userInfo.userPrincipalName);

    return NextResponse.json({
      connected: true,
      email: userInfo.mail || userInfo.userPrincipalName,
    });
  } catch (error) {
    console.error("OneDrive status error:", error);
    return NextResponse.json({ connected: false });
  }
}
