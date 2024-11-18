"use client";
import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";

// Change the type name (optional but consistent)
type Work = {
  title: string;
  description: string[];
  link?: string;
  tags: string[];
};

// Update the component name and prop type
function WorkCard({ work }: { work: Work }) {
  return (
    <Card
      className={`transition-colors hover:bg-muted/50 ${
        work.link ? "cursor-pointer" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{work.title}</h3>
              <div className="text-muted-foreground">
                {work.description.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index < work.description.length - 1 ? "mb-2" : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {work.link && (
              <Button
                variant="ghost"
                size="icon"
                className="pointer-events-none"
              >
                <Github className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {work.tags.map((tag) => (
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
  );
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Rename the array and its type
  const works: Work[] = [
    {
      title: "Popup Search Extension",
      description: [
        "An chromium web extension created with Claude that lets you search highlighted text through a variety of popup configurable search engines using keyboard shortcuts.",
      ],
      link: "https://github.com/agustinfitipaldi/popup-search",
      tags: ["AI", "Extension", "Javascript/HTML"],
    },
    {
      title: "Personal Rotten Tomatoes API",
      description: [
        "A personal use API for Rotten Tomatoes data, created with Claude. Made in conjunction with my movie info extension below.",
      ],
      link: "https://github.com/agustinfitipaldi/rt-scraper",
      tags: ["AI", "API", "Node.js"],
    },
    {
      title: "Rotten Tomatoes Info Extension",
      description: [
        "Chromium web extension made with Claude that queries my Rotten Tomatoes API and displays movie info underneath each poster in nzbgeeks.",
      ],
      link: "https://github.com/agustinfitipaldi/rotten-tomatoes-info",
      tags: ["AI", "Extension", "Javascript/HTML"],
    },
    {
      title: "DWP Viewer",
      description: [
        "A closed-access internal customer contact management system for Mathnasium franchises. Uses a variety of tools to enable a collaborative, data-fueled email composer for customer outreach.",
        "Designed and organized entirely by me. Development was done with the help of Cursor and friends =)",
        "Writeups coming soon...",
      ],
      tags: [
        "AI",
        "Next.js",
        "Tailwind CSS",
        "PostgreSQL",
        "NextAuth",
        "Resend",
        "Liveblocks",
      ],
    },
    {
      title: "Personal Website",
      description: ["This website! Made with Next.js and Tailwind CSS."],
      link: "https://github.com/agustinfitipaldi/agustinfitipaldi",
      tags: ["AI", "Next.js", "Tailwind CSS"],
    },
  ];

  const allTags = Array.from(new Set(works.flatMap((work) => work.tags)));

  // Handle tag toggle
  const handleTagClick = (tag: string) => {
    setActiveFilter((currentFilter) => (currentFilter === tag ? null : tag));
  };

  const filteredWorks = activeFilter
    ? works.filter((work) => work.tags.includes(activeFilter))
    : works;

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

      {/* Work Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">Work</h2>
          <div className="h-6 w-px bg-primary" />
          <span className="text-xl font-semibold">{filteredWorks.length}</span>
        </div>

        {/* Tags Filter - Modified to remove clear button */}
        <div className="flex gap-2 flex-wrap mb-6">
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={activeFilter === tag ? "default" : "secondary"}
              size="sm"
              onClick={() => handleTagClick(tag)}
              className="text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {filteredWorks.map((work) =>
            work.link ? (
              <Link
                key={work.title}
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WorkCard work={work} />
              </Link>
            ) : (
              <WorkCard key={work.title} work={work} />
            )
          )}
        </div>
      </section>
    </div>
  );
}
