"use client";

import { useState } from "react";
import BlueskyGallery from "@/components/BlueskyGallery";

export default function BlueskyPage() {
  const [contentHeight, setContentHeight] = useState(0);

  // Calculate total height by adding fixed padding to content height
  // pt-64 = 16rem = 256px
  // pb-96 = 24rem = 384px
  const totalHeight = contentHeight + 256 + 384;

  return (
    <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
      <div className="max-w-2xl mx-auto px-8 pt-64 pb-96">
        <h1 className="text-4xl font-bold mb-8">Bluesky Posts</h1>
        <BlueskyGallery onContentHeightChange={setContentHeight} />
      </div>
    </div>
  );
}
