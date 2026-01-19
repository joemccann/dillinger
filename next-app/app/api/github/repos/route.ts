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
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "30";

  if (!owner) {
    return NextResponse.json({ error: "Owner is required" }, { status: 400 });
  }

  try {
    // Check if owner is the authenticated user
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const user = await userResponse.json();

    let url: string;
    if (owner === user.login) {
      url = `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated`;
    } else {
      url = `https://api.github.com/orgs/${owner}/repos?page=${page}&per_page=${perPage}&sort=updated`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = await response.json();

    return NextResponse.json({
      items: repos.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        default_branch: repo.default_branch,
      })),
    });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
