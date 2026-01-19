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
  const branch = searchParams.get("branch");

  if (!owner || !repo || !branch) {
    return NextResponse.json(
      { error: "Owner, repo, and branch are required" },
      { status: 400 }
    );
  }

  try {
    // Get the tree for the branch
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

    const response = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for markdown files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markdownFiles = data.tree.filter(
      (item: Record<string, string>) =>
        item.type === "blob" &&
        (item.path.endsWith(".md") || item.path.endsWith(".markdown"))
    );

    return NextResponse.json(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      markdownFiles.map((file: Record<string, string>) => ({
        path: file.path,
        sha: file.sha,
        url: file.url,
      }))
    );
  } catch (error) {
    console.error("GitHub files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// Fetch single file content
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { owner, repo, path } = await request.json();

    if (!owner || !repo || !path) {
      return NextResponse.json(
        { error: "Owner, repo, and path are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
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

    const data = await response.json();

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    return NextResponse.json({
      content,
      sha: data.sha,
      path: data.path,
    });
  } catch (error) {
    console.error("GitHub file fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
