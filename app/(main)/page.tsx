import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Github,
  Linkedin,
  Mail,
  CreditCard,
  Bike,
  Instagram,
  AudioWaveform,
} from "lucide-react";
import Link from "next/link";
import { WritingSection } from "@/components/writing-section";
import { getAllPosts } from "@/lib/writing/utils";
import { ProjectsSection } from "@/components/projects-section";

export default async function Page() {
  const posts = await getAllPosts();

  return (
    <div className="pt-24 sm:pt-24">
      <div className="max-w-2xl mx-auto px-8">
        {/* Header Section */}
        <div className="relative mb-8">
          <Avatar className="float-left mr-6 mb-4 h-32 w-32">
            <AvatarImage
              src="/pfp.jpg"
              alt="Agustin Fitipaldi"
              className="object-cover"
            />
            <AvatarFallback>AF</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-2">Agustin Fitipaldi</h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4">
              Economics Major & Operations Specialist
            </p>
            <div className="flex justify-between sm:justify-start sm:gap-2 items-center w-full sm:w-auto">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/agustinfitipaldi"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://linkedin.com/in/agustinfitipaldi"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.strava.com/athletes/24497691"
                  title="Strava"
                >
                  <Bike className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://www.instagram.com/agustinfitipaldi/"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://open.spotify.com/user/mussorsgy"
                  title="Spotify"
                >
                  <AudioWaveform className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="mailto:agustin@fitipaldi.com" title="Email">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
              <div className="h-6 w-px bg-border" />
              <Button variant="ghost" className="flex gap-2" asChild>
                <Link href="/card" title="Digital Business Card">
                  <CreditCard className="h-5 w-5" />
                  <span>Card</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed">
            I&apos;m an undergrad majoring in Economics at the University of California, Santa Barbara.
            I will be pursuing a PhD after undergrad likely focused around Networks and Market Design.
            <br />
            <br />
            All of my development is largely a product of using Claude Code
            to bring my ideas to reality. Note the AI tag in my project list
            below to filter for it.
          </p>
        </section>

        {/* Writing Section */}
        <WritingSection posts={posts} />

        {/* Projects Section */}
        <ProjectsSection />

        {/* Economics Projects Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Interactive Economics</h2>
          <div className="grid gap-4">
            <Link
              href="/edgeworth"
              className="group p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Edgeworth Box</h3>
              <p className="text-muted-foreground">
                Interactive 2D Edgeworth box for exploring exchange economies
                and Pareto efficiency.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
