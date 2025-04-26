"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

interface BlueskyTimelineProps {
  posts: Array<{
    post: {
      uri: string;
      record: {
        createdAt: string;
        text: string;
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
      author: {
        displayName: string;
        handle: string;
        avatar?: string;
        did: string;
      };
    };
  }>;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  visiblePostUris?: Set<string>;
}

export default function BlueskyTimeline({
  posts,
  onDateRangeChange,
  visiblePostUris,
}: BlueskyTimelineProps) {
  const [isClient, setIsClient] = useState(false);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);
  const [startPosition, setStartPosition] = useState(0);
  const [endPosition, setEndPosition] = useState(100);
  const [hoveredPost, setHoveredPost] = useState<
    BlueskyTimelineProps["posts"][0] | null
  >(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);
  const lastDateRangeRef = useRef<{ startDate: Date; endDate: Date } | null>(
    null
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sort posts by date and get date range
  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(a.post.record.createdAt).getTime() -
      new Date(b.post.record.createdAt).getTime()
  );

  const earliestDate = new Date(
    sortedPosts[0]?.post.record.createdAt || new Date()
  );
  const latestDate = new Date(
    sortedPosts[sortedPosts.length - 1]?.post.record.createdAt || new Date()
  );

  // Calculate position for each post
  const getPostPosition = (date: Date) => {
    const totalTime = latestDate.getTime() - earliestDate.getTime();
    const postTime = date.getTime() - earliestDate.getTime();
    return (postTime / totalTime) * 100;
  };

  const handleMouseDown = (type: "start" | "end") => {
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const position =
      ((e.clientY - timelineRect.top) / timelineRect.height) * 100;
    const clampedPosition = Math.max(0, Math.min(100, position));

    if (isDragging === "start") {
      setStartPosition(Math.min(clampedPosition, endPosition));
    } else {
      setEndPosition(Math.max(clampedPosition, startPosition));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Update date range only when positions change
  useEffect(() => {
    if (!isClient) return;

    const startDate = new Date(
      earliestDate.getTime() +
        ((latestDate.getTime() - earliestDate.getTime()) * startPosition) / 100
    );
    const endDate = new Date(
      earliestDate.getTime() +
        ((latestDate.getTime() - earliestDate.getTime()) * endPosition) / 100
    );

    // Only update if the date range has actually changed
    if (
      !lastDateRangeRef.current ||
      lastDateRangeRef.current.startDate.getTime() !== startDate.getTime() ||
      lastDateRangeRef.current.endDate.getTime() !== endDate.getTime()
    ) {
      lastDateRangeRef.current = { startDate, endDate };
      onDateRangeChange(startDate, endDate);
    }
  }, [startPosition, endPosition, earliestDate, latestDate, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed right-8 top-32 bottom-32 w-40">
      <div className="flex flex-row items-center h-full">
        <div className="relative w-24 mr-6 h-full">
          {/* Preview card */}
          {hoveredPost && (
            <div
              className="fixed bg-background rounded-lg shadow-lg p-3 border border-border z-50 w-64"
              style={{
                left: `${mousePosition.x - 280}px`,
                top: `${mousePosition.y - 50}px`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                {hoveredPost.post.author.avatar && (
                  <img
                    src={hoveredPost.post.author.avatar}
                    alt={hoveredPost.post.author.displayName}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-xs">
                    {hoveredPost.post.author.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{hoveredPost.post.author.handle}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {format(
                  new Date(hoveredPost.post.record.createdAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
              </p>
              <p className="text-xs line-clamp-2">
                {hoveredPost.post.record.text}
              </p>
            </div>
          )}

          <div
            className="absolute text-xs text-muted-foreground right-0"
            style={{ top: "0%", transform: "translateY(-50%)" }}
          >
            {format(
              new Date(sortedPosts[0]?.post.record.createdAt || new Date()),
              "MMM d, yyyy"
            )}
          </div>

          <div
            className="absolute text-xs text-muted-foreground right-0"
            style={{ top: "100%", transform: "translateY(-50%)" }}
          >
            {format(
              new Date(
                sortedPosts[sortedPosts.length - 1]?.post.record.createdAt ||
                  new Date()
              ),
              "MMM d, yyyy"
            )}
          </div>
        </div>

        <div ref={timelineRef} className="relative w-px bg-foreground h-full">
          {/* Start selector */}
          <div
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer group z-30"
            style={{ top: `${startPosition}%` }}
            onMouseDown={() => handleMouseDown("start")}
          >
            <div className="w-8 h-3 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-0.5 bg-background/50 rounded-full" />
            </div>
          </div>

          {/* End selector */}
          <div
            className="absolute left-1/2 -translate-x-1/2 cursor-pointer group z-30"
            style={{ top: `${endPosition}%` }}
            onMouseDown={() => handleMouseDown("end")}
          >
            <div className="w-8 h-3 bg-primary rounded-full flex items-center justify-center">
              <div className="w-4 h-0.5 bg-background/50 rounded-full" />
            </div>
          </div>

          {/* Post markers */}
          {sortedPosts.map((post, index) => {
            const position = getPostPosition(
              new Date(post.post.record.createdAt)
            );
            const isVisible = visiblePostUris?.has(post.post.uri);
            return (
              <div
                key={index}
                className="absolute left-1/2 -translate-x-1/2 z-20"
                style={{ top: `${position}%` }}
                onMouseEnter={(e) => {
                  setHoveredPost(post);
                  setMousePosition({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) =>
                  setMousePosition({ x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setHoveredPost(null)}
              >
                <div
                  className={`
                    w-3 h-3 rounded-full
                    transition-all duration-300 ease-in-out
                    hover:scale-125
                    ${
                      isVisible
                        ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                        : "bg-muted-foreground/50"
                    }
                  `}
                />
              </div>
            );
          })}

          {/* Selected range highlight */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-px bg-primary/20 z-10"
            style={{
              top: `${startPosition}%`,
              height: `${endPosition - startPosition}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
