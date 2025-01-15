import { getPostBySlug } from "@/lib/blog/utils";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FootnoteEnhancer } from "@/components/footnote-enhancer";

export async function generateMetadata({
  params,
}: {
  params: {
    slug: string;
  };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.content.slice(0, 160),
  };
}

export default async function BlogPost({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <article className="prose dark:prose-invert prose-slate mx-auto pt-[25vh] pb-[35vh] px-8 max-w-2xl prose-a:no-underline prose-a:text-muted-foreground hover:prose-a:text-foreground prose-a:transition-colors [&_sup_a]:text-sm [&_sup_a]:font-mono [&_sup_a]:text-muted-foreground [&_sup]:ml-0.5 [&_sup]:top-[-0.55em] [&_.footnote-backref]:no-underline [&_.footnote-backref]:text-muted-foreground [&_.footnote-backref]:hover:text-foreground [&_.footnote-backref]:ml-1 [&_.footnote-backref]:font-mono [&_section.footnotes_a]:no-underline [&_section.footnotes_a]:text-muted-foreground [&_section.footnotes_a]:hover:text-foreground [&_section.footnotes_a]:font-mono [&_section.footnotes_.data-footnote-backref]:no-underline [&_section.footnotes_.data-footnote-backref]:bg-transparent [&_section.footnotes_.data-footnote-backref]:text-muted-foreground [&_section.footnotes_.data-footnote-backref]:hover:text-foreground [&_.flash-highlight]:animate-footnote-flash">
        <header className="mb-8 not-prose">
          <h1 className="mb-2 text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <div className="flex gap-2">
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
        </header>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>
      <FootnoteEnhancer />
    </div>
  );
}
