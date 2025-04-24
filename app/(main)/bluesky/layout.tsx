import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bluesky Posts | Agustin Fitipaldi",
  description: "A collection of my Bluesky posts",
};

export default function BlueskyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
