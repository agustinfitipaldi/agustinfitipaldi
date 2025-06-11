import { ThemeProvider } from "@/components/theme-provider";
import { SiteNav } from "@/components/site-nav";
import { getAllPosts } from "@/lib/writing/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function FileDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const posts = await getAllPosts();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex flex-col min-h-screen overflow-clip">
        <SiteNav posts={posts} />
        <ScrollArea type="hover" className="flex-1">
          <main className="lg:pt-0">{children}</main>
        </ScrollArea>
      </div>
    </ThemeProvider>
  );
}