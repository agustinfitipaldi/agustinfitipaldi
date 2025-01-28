import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import localFont from "next/font/local";
import "../globals.css";

const geistSans = localFont({
  src: "../../app/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "../../app/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export default function EconProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex">
            {/* Sidebar */}
            <div className="w-[200px] border-r p-4 flex flex-col gap-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="justify-start"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <div className="h-px bg-border" />
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-start"
                >
                  <Link href="/econ/edgeworth">Edgeworth Box</Link>
                </Button>
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
