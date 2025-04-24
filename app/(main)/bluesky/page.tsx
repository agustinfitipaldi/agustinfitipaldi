"use client";

import { useState, useEffect } from "react";
import BlueskyGallery from "@/components/BlueskyGallery";

export default function BlueskyPage() {
  const [contentHeight, setContentHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Add resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total height by adding fixed padding to content height
  // pt-64 = 16rem = 256px (on screens >= 640px)
  // pt-8 = 2rem = 32px (on mobile)
  // pb-96 = 24rem = 384px
  const totalHeight = contentHeight + (windowWidth >= 640 ? 256 : 32) + 384;

  return (
    <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
      <div className="max-w-2xl mx-auto px-8 pt-4 sm:pt-64 pb-96">
        <h1 className="text-4xl font-bold mb-8">Bluesky Posts</h1>
        <BlueskyGallery onContentHeightChange={setContentHeight} />
      </div>
    </div>
  );
}
