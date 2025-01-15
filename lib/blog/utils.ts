"use server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
};

export async function getAllPosts(): Promise<BlogPost[]> {
  console.log("Reading from directory:", postsDirectory);
  const fileNames = fs.readdirSync(postsDirectory);
  console.log("Found files:", fileNames);

  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      console.log("Reading file:", fileName);

      const matterResult = matter(fileContents);
      console.log("Parsed frontmatter:", matterResult.data);

      return {
        slug,
        content: matterResult.content,
        ...(matterResult.data as {
          title: string;
          date: string;
          tags: string[];
        }),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  console.log("Returning posts:", allPostsData);
  return allPostsData;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      content: matterResult.content,
      ...(matterResult.data as { title: string; date: string; tags: string[] }),
    };
  } catch {
    return null;
  }
}
