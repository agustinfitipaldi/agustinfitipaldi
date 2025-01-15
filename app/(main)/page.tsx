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
import { BlogSection } from "@/components/blog-section";
import { getAllPosts } from "@/lib/blog/utils";
import { ProjectsSection } from "@/components/projects-section";

export default async function Page() {
  const posts = await getAllPosts();

  return (
    <div className="p-8 max-w-2xl mx-auto">
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
              <a href="https://www.strava.com/athletes/24497691" title="Strava">
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
              <a href="https://open.spotify.com/user/mussorsgy" title="Spotify">
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
          Hi! Welcome to my website =)
          <br />
          <br />
          I&apos;m an undergrad double majoring in Economics, and Probability
          &amp; Statistics at the University of California, Santa Barbara.
          I&apos;m looking to pursue grad school in economics, and am interested
          in research surrounding the intersection of disciplines such as
          economics, history, and knowledge management.
          <br />
          <br />
          I work as an Operations Specialist for a couple of Mathnasium
          franchises in the Bay Area, where my responsibilities currently
          involve the development and maintenance of a customer contact
          management system.
          <br />
          <br />
          All of my web development is largely a product of using Claude Sonnet
          3.5, and O1-Mini in Cursor to bring my ideas to reality. Note the AI
          tag in my project list below to filter for it.
        </p>
      </section>

      {/* Projects Section */}
      <ProjectsSection />

      {/* Blog Section */}
      <BlogSection posts={posts} />
    </div>
  );
}
