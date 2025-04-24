"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BlueskyPost {
  post: {
    uri: string;
    cid: string;
    author: {
      did: string;
      handle: string;
      displayName: string;
      avatar?: string;
    };
    record: {
      text: string;
      createdAt: string;
      embed?: {
        images?: Array<{
          alt: string;
          image: {
            ref: {
              $link: string;
            };
            mimeType: string;
            size: number;
          };
        }>;
      };
      reply?: {
        root: {
          uri: string;
          cid: string;
        };
        parent: {
          uri: string;
          cid: string;
        };
      };
    };
    likeCount: number;
    replyCount: number;
    repostCount: number;
    quoteCount: number;
  };
}

type PostType = "posts" | "replies" | "reposts";

export default function BlueskyGallery() {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PostType | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/bluesky");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        console.log("Raw data from Bluesky API:", data);
        setPosts(data);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        console.error("Error fetching Bluesky posts:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Helper to check if a URI belongs to the current user
  const isMyUri = (uri: string) => {
    // Get all URIs from my posts
    const myUris = new Set(posts.map((p) => p.post.uri));
    return myUris.has(uri);
  };

  // Group posts by thread
  const threadMap = new Map<string, BlueskyPost[]>();
  posts.forEach((post) => {
    const rootUri = post.post.record.reply?.root.uri || post.post.uri;
    if (!threadMap.has(rootUri)) {
      threadMap.set(rootUri, []);
    }
    threadMap.get(rootUri)?.push(post);
  });

  // Sort threads by most recent post
  const sortedThreads = Array.from(threadMap.entries()).sort((a, b) => {
    const aLatest = a[1][0].post.record.createdAt;
    const bLatest = b[1][0].post.record.createdAt;
    return bLatest.localeCompare(aLatest);
  });

  // Calculate post counts and filter threads
  const categorizePost = (post: BlueskyPost): PostType | null => {
    // Check if it's a repost first
    if (post.post.repostCount > 0) {
      return "reposts";
    }

    // If it's not a reply, or it's a reply to self, it's a post
    if (
      !post.post.record.reply ||
      (post.post.record.reply && isMyUri(post.post.record.reply.root.uri))
    ) {
      return "posts";
    }

    // If it's a reply to someone else's post
    if (post.post.record.reply && !isMyUri(post.post.record.reply.root.uri)) {
      return "replies";
    }

    return null;
  };

  const postCounts = {
    posts: posts.filter((p) => categorizePost(p) === "posts").length,
    replies: posts.filter((p) => categorizePost(p) === "replies").length,
    reposts: posts.filter((p) => categorizePost(p) === "reposts").length,
  };

  // Filter posts based on active filter
  const filteredThreads = sortedThreads.filter(([, threadPosts]) => {
    if (!activeFilter) return true;
    const firstPost = threadPosts[0];
    return categorizePost(firstPost) === activeFilter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Posts</h2>
        <div className="h-6 w-px bg-primary" />
        <span className="text-xl font-semibold">{filteredThreads.length}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(["posts", "replies", "reposts"] as PostType[]).map((type) => (
          <Button
            key={type}
            variant={activeFilter === type ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveFilter(activeFilter === type ? null : type)}
            className="text-xs"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
            <span className="text-muted-foreground">{postCounts[type]}</span>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredThreads.map(([rootUri, threadPosts]) => (
          <Card key={rootUri} className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {threadPosts.map(({ post }, index) => (
                  <div
                    key={post.uri}
                    className={index > 0 ? "pl-4 border-l-2 border-border" : ""}
                  >
                    <div className="flex items-center mb-4">
                      {post.author.avatar && (
                        <img
                          src={post.author.avatar}
                          alt={post.author.displayName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {post.author.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          @{post.author.handle}
                        </p>
                      </div>
                    </div>

                    <p className="mb-4">{post.record.text}</p>

                    {post.record.embed?.images && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {post.record.embed.images.map((image, index) => (
                          <img
                            key={index}
                            src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${post.author.did}&cid=${image.image.ref.$link}`}
                            alt={image.alt}
                            className="rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {new Date(post.record.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-4">
                        <span>❤️ {post.likeCount}</span>
                        <span>🔄 {post.repostCount}</span>
                        <span>💬 {post.replyCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
