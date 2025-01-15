"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Menu, ArrowUp } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { writingPost } from "@/lib/writing/utils";
import { ModeToggle } from "./mode-toggle";
import { useScroll } from "@/hooks/use-scroll";

type NavItem = {
  title: string;
  href: string;
};

const mainNav: NavItem[] = [{ title: "Home", href: "/" }];

function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-foreground/80 font-semibold relative after:absolute after:-right-4 after:top-1/2 after:-translate-y-[20px] after:w-1 after:h-12 after:rounded-full",
        isActive
          ? "text-foreground after:bg-foreground"
          : "text-foreground/60 after:bg-transparent",
        className
      )}
    >
      {children}
    </Link>
  );
}

function WritingLinks({ posts }: { posts: writingPost[] }) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <NavLink
          key={post.slug}
          href={`/writing/${post.slug}`}
          className="block py-1 text-lg lg:text-xl lg:text-right"
        >
          {post.title}
        </NavLink>
      ))}
    </div>
  );
}

// Pages where the nav should be fixed to viewport
const fixedNavPages = ["/", "/writing"];

export function SiteNav({ posts }: { posts: writingPost[] }) {
  const { scrolledToTop } = useScroll();
  const pathname = usePathname();
  const isFixedNav = fixedNavPages.includes(pathname);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div
        className={cn(
          "lg:hidden w-full",
          isFixedNav ? "fixed top-0 left-0 right-0 z-50 p-4" : "relative"
        )}
      >
        <div
          className={cn("mx-auto max-w-2xl", !isFixedNav && "sticky top-0 p-4")}
        >
          <div className="flex items-center justify-between rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm px-4 h-14">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-6">
                <div className="flex flex-col gap-8 py-4">
                  <nav className="flex flex-col gap-6 items-end">
                    {mainNav.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        className="text-4xl"
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </nav>
                  <div className="flex flex-col gap-6 items-end">
                    <div className="space-y-4 w-full">
                      <div className="h-px bg-border" />
                    </div>
                    <WritingLinks posts={posts} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {!scrolledToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-sm lg:hidden transition-opacity duration-200"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:flex-col lg:w-[300px] lg:fixed lg:right-[calc(50%+15rem)] lg:top-[33vh] lg:h-[calc(100vh-4rem)] lg:gap-8 lg:z-10">
        <nav className="flex flex-col gap-6 items-end">
          <div className="-mb-2 -mr-4">
            <ModeToggle />
          </div>
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href} className="text-4xl">
              {item.title}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-6 items-end">
          <div className="space-y-4 w-full">
            <div className="h-px bg-border" />
          </div>
          <WritingLinks posts={posts} />
        </div>
      </div>
    </>
  );
}
