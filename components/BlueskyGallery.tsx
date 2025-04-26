"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Heart, Repeat2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBluesky, PostType } from "@/contexts/BlueskyContext";
import BlueskyFilters from "./BlueskyFilters";

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
        record?: {
          uri: string;
          cid: string;
          author: {
            did: string;
            handle: string;
            displayName: string;
            avatar?: string;
          };
          value: {
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
          };
        };
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

interface BlueskyGalleryProps {
  onContentHeightChange?: (height: number) => void;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <div className="h-6 w-px bg-border" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BlueskyGallery({
  onContentHeightChange,
}: BlueskyGalleryProps) {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>(
    {}
  );
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    activeFilters,
    isChronological,
    dateRange,
    updateFilteredThreads,
    registerPostElement,
    unregisterPostElement,
  } = useBluesky();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format dates consistently
  useEffect(() => {
    if (!isClient) return;

    const dates: Record<string, string> = {};
    posts.forEach(({ post }) => {
      dates[post.uri] = new Date(post.record.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
    });
    setFormattedDates(dates);
  }, [posts, isClient]);

  // Update parent about content height changes
  useEffect(() => {
    if (contentRef.current && onContentHeightChange) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onContentHeightChange(entry.contentRect.height);
        }
      });

      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, [onContentHeightChange]);

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

  // Calculate post counts and categorize posts
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

  // Group posts by thread
  const threadMap = new Map<string, BlueskyPost[]>();
  posts.forEach((post) => {
    const rootUri = post.post.record.reply?.root.uri || post.post.uri;
    if (!threadMap.has(rootUri)) {
      threadMap.set(rootUri, []);
    }
    threadMap.get(rootUri)?.push(post);
  });

  // Create the thread structure
  const sortedThreads = Array.from(threadMap.entries()).map(
    ([rootUri, threadPosts]) => {
      return [rootUri, threadPosts] as [string, BlueskyPost[]];
    }
  );

  // Filter posts based on date range
  let dateFilteredThreads = sortedThreads;
  if (dateRange) {
    dateFilteredThreads = dateFilteredThreads.filter(([, threadPosts]) => {
      const postDate = new Date(threadPosts[0].post.record.createdAt);
      return postDate >= dateRange.startDate && postDate <= dateRange.endDate;
    });
  }

  // Filter posts based on active filters (OR logic)
  let filteredThreads =
    activeFilters.size > 0
      ? dateFilteredThreads.filter(([, threadPosts]) => {
          const category = categorizePost(threadPosts[0]);
          return category && activeFilters.has(category);
        })
      : dateFilteredThreads;

  // Sort all threads by timestamp
  filteredThreads = [...filteredThreads].sort((a, b) => {
    if (isChronological) {
      const aTime = new Date(a[1][0].post.record.createdAt).getTime();
      const bTime = new Date(b[1][0].post.record.createdAt).getTime();
      return aTime - bTime;
    } else {
      const aTime = Math.max(
        ...a[1].map((p) => new Date(p.post.record.createdAt).getTime())
      );
      const bTime = Math.max(
        ...b[1].map((p) => new Date(p.post.record.createdAt).getTime())
      );
      return bTime - aTime;
    }
  });

  // Update filtered threads in context
  useEffect(() => {
    updateFilteredThreads(filteredThreads);
  }, [filteredThreads, updateFilteredThreads]);

  // Register/unregister post elements for intersection observer
  useEffect(() => {
    const postElements = contentRef.current?.querySelectorAll("[data-uri]");
    if (postElements) {
      postElements.forEach((element) => {
        registerPostElement(element as HTMLElement);
      });
    }

    return () => {
      if (postElements) {
        postElements.forEach((element) => {
          unregisterPostElement(element as HTMLElement);
        });
      }
    };
  }, [registerPostElement, unregisterPostElement, filteredThreads]);

  // Calculate post counts based on all posts (not filtered)
  const postCounts = {
    posts: dateFilteredThreads.filter(
      ([, threadPosts]) => categorizePost(threadPosts[0]) === "posts"
    ).length,
    replies: dateFilteredThreads.filter(
      ([, threadPosts]) => categorizePost(threadPosts[0]) === "replies"
    ).length,
    reposts: dateFilteredThreads.filter(
      ([, threadPosts]) => categorizePost(threadPosts[0]) === "reposts"
    ).length,
  };

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div ref={contentRef}>
      <BlueskyFilters postCounts={postCounts} />
      <div className="flex flex-col gap-4">
        {filteredThreads.map(([rootUri, threadPosts]) => (
          <Card key={rootUri} className="transition-colors hover:bg-muted/50">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {threadPosts.map(({ post }, index) => (
                  <div
                    key={post.uri}
                    data-uri={post.uri}
                    className={
                      index > 0 ? "pl-4 ml-4 border-l-2 border-border" : ""
                    }
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
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

                    {post.record.embed?.record?.value && (
                      <div className="border rounded-lg p-4 mb-4 bg-muted/50">
                        <div className="flex items-center mb-2">
                          {post.record.embed?.record?.author?.avatar && (
                            <img
                              src={post.record.embed.record.author.avatar}
                              alt={
                                post.record.embed.record.author.displayName ||
                                "Quoted post author"
                              }
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {post.record.embed?.record?.author?.displayName ||
                                "Unknown author"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              @
                              {post.record.embed?.record?.author?.handle ||
                                "unknown"}
                            </p>
                          </div>
                        </div>
                        {post.record.embed?.record?.value.text && (
                          <p className="text-sm mb-2">
                            {post.record.embed.record.value.text}
                          </p>
                        )}
                        {post.record.embed?.record?.value.embed?.images &&
                          post.record.embed.record.value.embed.images.length >
                            0 && (
                            <div className="grid grid-cols-2 gap-2">
                              {post.record.embed.record.value.embed.images.map(
                                (image, index) => (
                                  <img
                                    key={index}
                                    src={`https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${
                                      post.record.embed?.record?.author?.did ||
                                      ""
                                    }&cid=${image.image.ref.$link}`}
                                    alt={image.alt || "Quoted post image"}
                                    className="rounded-lg"
                                  />
                                )
                              )}
                            </div>
                          )}
                        {post.record.embed?.record?.author?.handle && (
                          <a
                            href={`https://bsky.app/profile/${
                              post.record.embed.record.author.handle
                            }/post/${post.record.embed.record.uri
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2 block"
                            title="View original post"
                          >
                            View original post
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formattedDates[post.uri] || "Loading..."}</span>
                      <a
                        href={`https://bsky.app/profile/${
                          post.author.handle
                        }/post/${post.uri.split("/").pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-4 hover:text-foreground transition-colors"
                        title="View on Bluesky"
                      >
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
                      </a>
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
