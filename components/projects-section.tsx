"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";
import Link from "next/link";

type Project = {
  title: string;
  description: string[];
  link?: string;
  tags: string[];
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      className={`transition-colors hover:bg-muted/50 ${
        project.link ? "cursor-pointer" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{project.title}</h3>
              <div className="text-muted-foreground">
                {project.description.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index < project.description.length - 1 ? "mb-2" : ""
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {project.link && (
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
  );
}

export function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const projects: Project[] = [
    {
      title: "ManicTime Server",
      description: [
        "Setup server on digital ocean droplet with the help of cursor to host a ManicTime server instance and track computer usage across several devices.",
      ],
      tags: ["AI", "server", "shell", "sysadmin", "ssh"],
    },
    {
      title: "ettle",
      description: [
        "An entirely custom task manager built for myself on Supabase and hosted on Cloudflare. In early development but open for use by others.","UPDATE: Project has been put on pause as I develop an idea base that's more sound.",
      ],
      link: "https://ettle.me",
      tags: ["AI", "Next.js", "Tailwind CSS", "Supabase", "Cloudflare"],
    },
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
        "Initially designed and developed by me, has since been passed onto a more dedicated team",
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

  const allTags = Array.from(
    new Set(projects.flatMap((project) => project.tags))
  );

  const tagCounts = projects.reduce((acc, project) => {
    project.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleTagClick = (tag: string) => {
    setActiveFilter((currentFilter) => (currentFilter === tag ? null : tag));
  };

  const filteredProjects = activeFilter
    ? projects.filter((project) => project.tags.includes(activeFilter))
    : projects;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <div className="h-6 w-px bg-primary" />
        <span className="text-xl font-semibold">{filteredProjects.length}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {allTags.map((tag) => (
          <Button
            key={tag}
            variant={activeFilter === tag ? "default" : "secondary"}
            size="sm"
            onClick={() => handleTagClick(tag)}
            className="text-xs"
          >
            {tag}{" "}
            <span className="text-muted-foreground">{tagCounts[tag]}</span>
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filteredProjects.map((project) =>
          project.link ? (
            <Link
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ProjectCard project={project} />
            </Link>
          ) : (
            <ProjectCard key={project.title} project={project} />
          )
        )}
      </div>
    </section>
  );
}
