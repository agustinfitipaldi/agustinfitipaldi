import Link from "next/link";
import { BlogPost } from "@/lib/blog/utils";
import { Card, CardContent } from "./ui/card";

export function BlogSection({ posts = [] }: { posts?: BlogPost[] }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Blog</h2>
        <div className="h-6 w-px bg-primary" />
        <span className="text-xl font-semibold">{posts.length}</span>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
