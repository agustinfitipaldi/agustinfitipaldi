import { BskyAgent } from "@atproto/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Debug environment variables (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Username exists:", !!process.env.BLUESKY_USERNAME);
      console.log("Password exists:", !!process.env.BLUESKY_PASSWORD);
    }

    if (!process.env.BLUESKY_USERNAME || !process.env.BLUESKY_PASSWORD) {
      return NextResponse.json(
        { error: "Missing Bluesky credentials" },
        { status: 500 }
      );
    }

    const agent = new BskyAgent({
      service: "https://bsky.social",
    });

    await agent.login({
      identifier: process.env.BLUESKY_USERNAME,
      password: process.env.BLUESKY_PASSWORD,
    });

    const response = await agent.getAuthorFeed({
      actor: agent.session?.did || "",
    });

    if (response.success) {
      return NextResponse.json(response.data.feed);
    }

    return NextResponse.json(
      { error: "Failed to fetch feed", details: response },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error fetching Bluesky posts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
