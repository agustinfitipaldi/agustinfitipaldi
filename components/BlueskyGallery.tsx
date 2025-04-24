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

  // Group posts by thread
  const threadMap = new Map<string, BlueskyPost[]>();
  posts.forEach((post) => {
    const rootUri = post.post.record.reply?.root.uri || post.post.uri;
    if (!threadMap.has(rootUri)) {
      threadMap.set(rootUri, []);
    }
    threadMap.get(rootUri)?.push(post);
  });

  console.log(
    "All posts:",
    posts.map((p) => ({
      uri: p.post.uri,
      text: p.post.record.text.slice(0, 50) + "...",
      isReply: !!p.post.record.reply,
      replyTo: p.post.record.reply
        ? {
            root: p.post.record.reply.root.uri,
            parent: p.post.record.reply.parent.uri,
          }
        : null,
      repostCount: p.post.repostCount,
    }))
  );

  console.log(
    "Thread map:",
    Array.from(threadMap.entries()).map(([rootUri, posts]) => ({
      rootUri,
      postCount: posts.length,
      firstPost: {
        text: posts[0].post.record.text.slice(0, 50) + "...",
        isReply: !!posts[0].post.record.reply,
        repostCount: posts[0].post.repostCount,
      },
    }))
  );

  // Sort threads by most recent post
  const sortedThreads = Array.from(threadMap.entries()).sort((a, b) => {
    const aLatest = a[1][0].post.record.createdAt;
    const bLatest = b[1][0].post.record.createdAt;
    return bLatest.localeCompare(aLatest);
  });

  // Helper function to determine post type
  const getPostType = (post: BlueskyPost): PostType | null => {
    if (
      post.post.record.reply?.parent.uri !== post.post.record.reply?.root.uri
    ) {
      return "replies";
    }
    if (post.post.repostCount > 0) {
      return "reposts";
    }
    if (!post.post.record.reply) {
      return "posts";
    }
    return null;
  };

  // Calculate post counts based on the first post in each thread
  const postCounts = {
    posts: sortedThreads.filter(
      ([, threadPosts]) => !threadPosts[0].post.record.reply
    ).length,
    replies: sortedThreads.filter(
      ([, threadPosts]) =>
        threadPosts[0].post.record.reply?.parent.uri !==
        threadPosts[0].post.record.reply?.root.uri
    ).length,
    reposts: sortedThreads.filter(
      ([, threadPosts]) => threadPosts[0].post.repostCount > 0
    ).length,
  };

  console.log("Post counts:", postCounts);
  console.log("Filtered counts:", {
    posts: posts.filter((p) => !p.post.record.reply).length,
    replies: posts.filter(
      (p) => p.post.record.reply?.parent.uri !== p.post.record.reply?.root.uri
    ).length,
    reposts: posts.filter((p) => p.post.repostCount > 0).length,
  });

  // Filter posts based on active filter
  const filteredThreads = sortedThreads.filter(([, threadPosts]) => {
    if (!activeFilter) return true;
    const firstPost = threadPosts[0];

    switch (activeFilter) {
      case "posts":
        return !firstPost.post.record.reply;
      case "replies":
        return (
          firstPost.post.record.reply?.parent.uri !==
          firstPost.post.record.reply?.root.uri
        );
      case "reposts":
        return firstPost.post.repostCount > 0;
      default:
        return true;
    }
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
