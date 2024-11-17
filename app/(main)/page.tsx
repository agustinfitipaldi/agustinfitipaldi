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
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Popup Search Extension
                    </h3>
                    <p className="text-muted-foreground">
                      An Edge/Chrome extension that I created with Claude that
                      lets you search highlighted text through a variety of
                      custom search engines. Search can either be done through
                      the context menu or by using (limited) keyboard shortcuts.
                      <br />
                      <br />
                      Default search engines are: Kagi, Oxford English
                      Dictionary, Webster&apos;s 1913, and UCSB Library.
                      <br />
                      <br />
                      Supports settings exporting and importing.
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href="https://github.com/agustinfitipaldi/popup-search"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                    Extension
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
