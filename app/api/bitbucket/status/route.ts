export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("bitbucket_token");

    console.log("Bitbucket status check - cookie exists:", !!tokenCookie);

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);
    console.log("Bitbucket token parsed, checking with API...");

    // Verify token is still valid
    const response = await fetch("https://api.bitbucket.org/2.0/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    console.log("Bitbucket API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bitbucket API error:", response.status, errorText);
      return NextResponse.json({ connected: false });
    }

    const user = await response.json();
    console.log("Bitbucket connected successfully, user:", user.username);

    return NextResponse.json({
      connected: true,
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    console.error("Bitbucket status error:", error);
    return NextResponse.json({ connected: false });
  }
}
