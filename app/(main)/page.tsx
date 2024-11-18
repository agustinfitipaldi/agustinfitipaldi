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

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const projects = [
    {
      title: "Popup Search Extension",
      description:
        "An chromium web extension created with Claude that lets you search highlighted text through a variety of popup configurable search engines using keyboard shortcuts.",
      link: "https://github.com/agustinfitipaldi/popup-search",
      tags: ["Extension", "Javascript/HTML"],
    },
    {
      title: "Unofficial Rotten Tomatoes API",
      description:
        "A personal use API for Rotten Tomatoes data, created with Claude. Made in conjunction with my movie info extension below.",
      link: "https://github.com/agustinfitipaldi/rt-scraper",
      tags: ["API", "Node.js"],
    },
    {
      title: "Rotten Tomatoes Info",
      description:
        "Chromium web extension made with Claude that queries my Rotten Tomatoes API and displays movie info underneath each poster in nzbgeeks.",
      link: "https://github.com/agustinfitipaldi/rotten-tomatoes-info",
      tags: ["Extension", "Javascript/HTML"],
    },
  ];

  const allTags = Array.from(
    new Set(projects.flatMap((project) => project.tags))
  );

  // Handle tag toggle
  const handleTagClick = (tag: string) => {
    setActiveFilter((currentFilter) => (currentFilter === tag ? null : tag));
  };

  const filteredProjects = activeFilter
    ? projects.filter((project) => project.tags.includes(activeFilter))
    : projects;

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
          I am an undergrad majoring in Economics at University of California,
          Santa Barbara. I&apos;ve got an intense passion and curiosity for the
          complex systems we&apos;ve created to manage the resources around us.
          In particular, I&apos;m interested in learning, and eventually
          contributing to research, on the ecosystems governments can create to
          better facilitate the human experience.
          <br />
          <br />
          I&apos;m pursuing grad school, and would love to explore internships
          or other job experiences surrounding economics in government.
          <br />
          <br />
          Outside of work, I&apos;m an avid reader with a penchant for 18th and
          19th century history, diaries, and letters. I also enjoy road cycling,
          watching football and working on my car.
        </p>
      </section>

      {/* Projects Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <div className="h-6 w-px bg-primary" />
          <span className="text-xl font-semibold">
            {filteredProjects.length}
          </span>
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
          {filteredProjects.map((project) => (
            <Link
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {project.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-none"
                      >
                        <Github className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {project.tags.map((tag) => (
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
    </div>
  );
}
