"use client";

import { useState, useEffect, useRef } from "react";
import BlueskyGallery from "@/components/BlueskyGallery";
import BlueskyTimeline from "@/components/BlueskyTimeline";
import { BlueskyProvider } from "@/contexts/BlueskyContext";

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
    };
  };
}

export default function BlueskyPage() {
  const [contentHeight, setContentHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Initialize client-side state
  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        console.error("Error fetching Bluesky posts:", err);
      }
    }

    fetchPosts();
  }, []);

  // Calculate total height by adding fixed padding to content height
  // pt-64 = 16rem = 256px (on screens >= 640px)
  // pt-8 = 2rem = 32px (on mobile)
  // pb-96 = 24rem = 384px
  const totalHeight = contentHeight + (windowWidth >= 640 ? 256 : 32) + 384;

  return (
    <BlueskyProvider>
      <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
        <div
          ref={galleryRef}
          className="max-w-2xl mx-auto px-8 pt-4 sm:pt-64 pb-96"
        >
          <h1 className="text-4xl font-bold mb-8">Bluesky</h1>
          <BlueskyGallery onContentHeightChange={setContentHeight} />
        </div>
        {posts.length > 0 && windowWidth >= 640 && (
          <BlueskyTimeline posts={posts} />
        )}
      </div>
    </BlueskyProvider>
  );
}
