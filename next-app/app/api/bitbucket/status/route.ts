import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("bitbucket_token");

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // Verify token is still valid
    const response = await fetch("https://api.bitbucket.org/2.0/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false });
    }

    const user = await response.json();

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
