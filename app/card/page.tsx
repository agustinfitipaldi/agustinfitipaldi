"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Home } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { QRCodeSVG } from "qrcode.react";

export default function BusinessCard() {
  const [orientation, setOrientation] = useState("portrait");
  const [showQR, setShowQR] = useState(false);

  // Handle orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerWidth > 768
          ? "landscape"
          : window.innerHeight > window.innerWidth
          ? "portrait"
          : "landscape"
      );
    };

    handleOrientationChange();
    window.addEventListener("resize", handleOrientationChange);
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  return (
    <main className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      {/* Add overlay QR code */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center cursor-pointer"
          onClick={() => setShowQR(false)}
        >
          <div
            className="p-4 bg-white rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeSVG
              value={`BEGIN:VCARD
VERSION:3.0
FN:Agustin Fitipaldi
TITLE:Economics Major & Systems Operations Specialist
EMAIL:agustin@fitipaldi.com
URL:https://agustinfitipaldi.com
END:VCARD`}
              size={250}
              level="H"
              includeMargin
            />
          </div>
        </div>
      )}

      <div
        className={`bg-card text-card-foreground shadow-lg rounded-xl relative ${
          orientation === "landscape"
            ? "h-[90vh] max-h-[600px] aspect-[1.6/1] flex items-center p-8 gap-8"
            : "min-h-fit p-6 flex flex-col items-center"
        }`}
      >
        {/* Theme Toggle - Positioned absolutely in the corner */}
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>

        {/* Profile Section */}
        <div
          className={`${
            orientation === "landscape" ? "w-1/3" : "mb-4"
          } flex flex-col items-center`}
        >
          <Avatar
            className={`${
              orientation === "landscape" ? "h-28 w-28" : "h-24 w-24"
            } mb-4`}
          >
            <AvatarImage
              src="/pfp.jpg"
              alt="Agustin Fitipaldi"
              className="object-cover"
            />
            <AvatarFallback>AF</AvatarFallback>
          </Avatar>
        </div>

        {/* Info Section */}
        <div
          className={`${
            orientation === "landscape" ? "w-2/3" : "w-full"
          } text-center ${orientation === "landscape" ? "text-left" : ""}`}
        >
          <h1 className="text-2xl font-bold mb-2">Agustin Fitipaldi</h1>
          <p className="text-muted-foreground mb-2">
            Economics Major & Systems Operations Specialist
          </p>
          <p className="text-sm mb-4">
            UCSB Economics | Research Interest in Government Systems
          </p>

          {/* Contact Links */}
          <div className="flex justify-center gap-4 mb-4">
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://github.com/agustinfitipaldi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://linkedin.com/in/agustinfitipaldi"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href="mailto:agustin@fitipaldi.com">
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Update the QR button to just toggle the overlay */}
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            className="w-full mb-2"
          >
            Show QR Code
          </Button>

          {/* Existing Back to Home button */}
          <Button variant="secondary" asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              View Full Profile
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
