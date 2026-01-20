import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("medium_token");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const tokens = JSON.parse(tokenCookie.value);

    // First, get the user ID
    const userResponse = await fetch("https://api.medium.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to get user info" }, { status: 500 });
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    const { title, content, tags, publishStatus } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    // Create the post
    const postResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title,
        contentFormat: "markdown",
        content,
        tags: tags || [],
        publishStatus: publishStatus || "draft", // "public", "draft", or "unlisted"
      }),
    });

    if (!postResponse.ok) {
      const error = await postResponse.text();
      console.error("Medium publish error:", error);
      return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
    }

    const postData = await postResponse.json();

    return NextResponse.json({
      success: true,
      url: postData.data.url,
      id: postData.data.id,
    });
  } catch (error) {
    console.error("Medium publish error:", error);
    return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
  }
}
