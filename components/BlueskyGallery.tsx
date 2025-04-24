"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  Heart,
  Repeat2,
  Clock,
  CalendarDays,
} from "lucide-react";

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
  const [activeFilters, setActiveFilters] = useState<Set<PostType>>(new Set());
  const [isChronological, setIsChronological] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/bluesky");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
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
    const myUris = new Set(posts.map((p) => p.post.uri));
    return myUris.has(uri);
  };

  // Group posts by thread and organize them hierarchically
  const threadMap = new Map<string, BlueskyPost[]>();
  posts.forEach((post) => {
    const rootUri = post.post.record.reply?.root.uri || post.post.uri;
    if (!threadMap.has(rootUri)) {
      threadMap.set(rootUri, []);
    }
    threadMap.get(rootUri)?.push(post);
  });

  // Sort posts within each thread by parent-child relationship
  const sortedThreads = Array.from(threadMap.entries()).map(
    ([rootUri, threadPosts]) => {
      // Sort posts so that parent posts come before their children
      const sortedPosts = [...threadPosts].sort((a, b) => {
        if (!a.post.record.reply) return -1;
        if (!b.post.record.reply) return 1;
        if (a.post.record.reply.parent.uri === b.post.uri) return 1;
        if (b.post.record.reply.parent.uri === a.post.uri) return -1;
        return isChronological
          ? new Date(a.post.record.createdAt).getTime() -
              new Date(b.post.record.createdAt).getTime()
          : 0;
      });
      return [rootUri, sortedPosts] as [string, BlueskyPost[]];
    }
  );

  // Sort threads by the timestamp of their root post or most recent post
  sortedThreads.sort((a, b) => {
    const aTime = isChronological
      ? new Date(a[1][0].post.record.createdAt).getTime()
      : Math.max(
          ...a[1].map((p) => new Date(p.post.record.createdAt).getTime())
        );
    const bTime = isChronological
      ? new Date(b[1][0].post.record.createdAt).getTime()
      : Math.max(
          ...b[1].map((p) => new Date(p.post.record.createdAt).getTime())
        );
    return bTime - aTime;
  });

  // Calculate post counts and filter threads
  const categorizePost = (post: BlueskyPost): PostType | null => {
    if (post.post.repostCount > 0) {
      return "reposts";
    }
    if (
      !post.post.record.reply ||
      (post.post.record.reply && isMyUri(post.post.record.reply.root.uri))
    ) {
      return "posts";
    }
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

  // Filter posts based on active filters (OR logic)
  const filteredThreads =
    activeFilters.size > 0
      ? sortedThreads.filter(([, threadPosts]) => {
          const category = categorizePost(threadPosts[0]);
          return category && activeFilters.has(category);
        })
      : sortedThreads;

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  const toggleFilter = (type: PostType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">Posts</h2>
          <div className="h-6 w-px bg-primary" />
          <span className="text-xl font-semibold">
            {filteredThreads.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsChronological(!isChronological)}
          className="flex items-center gap-2"
        >
          {isChronological ? (
            <Clock className="h-4 w-4" />
          ) : (
            <CalendarDays className="h-4 w-4" />
          )}
          {isChronological ? "Chronological" : "Latest Activity"}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(["posts", "replies", "reposts"] as PostType[]).map((type) => (
          <Button
            key={type}
            variant={activeFilters.has(type) ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter(type)}
            className="text-xs"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
            <span className="text-muted-foreground ml-1">
              {postCounts[type]}
            </span>
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
                    className={
                      index > 0 ? "pl-4 ml-4 border-l-2 border-border" : ""
                    }
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
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-4 w-4" /> {post.repostCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />{" "}
                          {post.replyCount}
                        </span>
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
