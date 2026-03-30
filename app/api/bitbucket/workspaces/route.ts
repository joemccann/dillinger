export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("bitbucket_token");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokens = JSON.parse(tokenCookie.value);

    const response = await fetch("https://api.bitbucket.org/2.0/workspaces", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
    }

    const data = await response.json();

    const workspaces = data.values.map((ws: { slug: string; name: string }) => ({
      slug: ws.slug,
      name: ws.name,
    }));

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Bitbucket workspaces error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}
