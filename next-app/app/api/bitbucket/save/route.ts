import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("bitbucket_token");

  if (!tokenCookie) return null;

  const tokens = JSON.parse(tokenCookie.value);
  return tokens.access_token;
}

export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { workspace, repo, branch, path, content, message } = await request.json();

    if (!workspace || !repo || !path || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const branchRef = branch || "main";
    const commitMessage = message || `Update ${path}`;

    // Create form data for the commit
    const formData = new FormData();
    formData.append(path, content);
    formData.append("message", commitMessage);
    formData.append("branch", branchRef);

    const response = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${workspace}/${repo}/src`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Bitbucket save error:", error);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      path,
    });
  } catch (error) {
    console.error("Bitbucket save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
