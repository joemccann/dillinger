export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("bitbucket_token");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokens = JSON.parse(tokenCookie.value);
    const searchParams = request.nextUrl.searchParams;
    const workspace = searchParams.get("workspace");
    const repo = searchParams.get("repo");

    if (!workspace || !repo) {
      return NextResponse.json({ error: "Workspace and repo required" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/refs/branches`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
    }

    const data = await response.json();

    const branches = data.values.map((branch: { name: string }) => ({
      name: branch.name,
    }));

    return NextResponse.json({ branches });
  } catch (error) {
    console.error("Bitbucket branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
