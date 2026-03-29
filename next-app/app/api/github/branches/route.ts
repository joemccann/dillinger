export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const branches = await response.json();

    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      branches.map((branch: Record<string, any>) => ({
        name: branch.name,
        sha: branch.commit.sha,
      }))
    );
  } catch (error) {
    console.error("GitHub branches error:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}
