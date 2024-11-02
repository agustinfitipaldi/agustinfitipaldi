import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, CreditCard } from "lucide-react";
import Link from "next/link";
// import { Card, CardContent } from "@/components/ui/card";
export default function Home() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="relative mb-8">
        <Avatar className="sm:float-right sm:ml-6 mb-4 sm:h-32 sm:w-32 h-32 w-32 mx-auto block">
          <AvatarImage
            src="/pfp.jpg"
            alt="Agustin Fitipaldi"
            className="object-cover"
          />
          <AvatarFallback>AF</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-4xl font-bold mb-2">Agustin Fitipaldi</h1>
          <p className="text-muted-foreground text-lg mb-4">
            Economics Major & Systems Operations Specialist
          </p>
          <div className="flex gap-4 items-center">
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

      {/* Projects/Work Section */}
      {/* <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Experiments</h2>
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Audio Data Transfer</h3>
                  <p className="text-muted-foreground">
                    Experimental feature for transferring text data via audio
                    signals between devices
                  </p>
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/audio-share">
                    <Radio className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}
    </div>
  );
}
