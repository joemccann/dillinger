import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("medium_token");

    if (!tokenCookie) {
      return NextResponse.json({ connected: false });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // Verify token is still valid
    const response = await fetch("https://api.medium.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false });
    }

    const data = await response.json();

    return NextResponse.json({
      connected: true,
      username: data.data.username,
      name: data.data.name,
      userId: data.data.id,
    });
  } catch (error) {
    console.error("Medium status error:", error);
    return NextResponse.json({ connected: false });
  }
}
