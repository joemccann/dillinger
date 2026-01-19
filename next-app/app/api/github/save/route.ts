import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { owner, repo, path, content, sha, message, branch } =
      await request.json();

    if (!owner || !repo || !path || !content || !branch) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encode content to base64
    const encodedContent = Buffer.from(content).toString("base64");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: Record<string, any> = {
      message: message || `Update ${path}`,
      content: encodedContent,
      branch,
    };

    // Include SHA if updating existing file
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      content: {
        path: data.content.path,
        sha: data.content.sha,
      },
    });
  } catch (error) {
    console.error("GitHub save error:", error);
    const message = error instanceof Error ? error.message : "Failed to save file";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
