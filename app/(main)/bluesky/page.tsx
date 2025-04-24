import { Metadata } from "next";
import BlueskyGallery from "@/components/BlueskyGallery";

export const metadata: Metadata = {
  title: "Bluesky Posts | Agustin Fitipaldi",
  description: "A collection of my Bluesky posts",
};

export default function BlueskyPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Bluesky Posts</h1>
      <BlueskyGallery />
    </div>
  );
}
