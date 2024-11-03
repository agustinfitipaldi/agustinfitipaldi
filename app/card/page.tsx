"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Home, Download, QrCode } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { QRCodeSVG } from "qrcode.react";
import VCard from "vcf"; // Import the vcf library

export default function BusinessCard() {
  const [orientation, setOrientation] = useState("portrait");
  const [showQR, setShowQR] = useState(false);

  // Use vcf library to generate vCard data
  const generateVCardData = () => {
    const vCard = new VCard();

    vCard.set("version", "3.0");
    vCard.set("fn", "Agustin Fitipaldi");
    vCard.set("n", "Fitipaldi;Agustin;;;");
    vCard.set("gender", "M");
    vCard.set("bday", "2001-11-29");
    vCard.set("title", "Economics Major");
    vCard.set("email", "agustin@fitipaldi.com");
    vCard.set("tel", "+14157452672"); // Corrected from "phone" to "tel"
    vCard.set("url", "https://agustinfitipaldi.com");
    vCard.set("org", "University of California, Santa Barbara");
    vCard.set("role", "Student");

    return vCard.toString();
  };

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

  // Function to download vCard
  const downloadVCard = () => {
    const element = document.createElement("a");
    const file = new Blob([generateVCardData()], {
      type: "text/vcard;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = "contact.vcf";
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
  };

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
              value={generateVCardData()}
              size={250}
              level="H"
              marginSize={1}
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
        {/* Back Button - Positioned absolutely in the top left corner */}
        <div className="absolute top-4 left-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Theme Toggle - Positioned absolutely in the top right corner */}
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
              orientation === "landscape" ? "h-44 w-44" : "h-32 w-32"
            } mb-4 ml-8`}
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

          {/* QR Code and Download Contact Buttons */}
          <div className="flex w-full gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowQR(true)}
              className="w-1/2"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button
              variant="outline"
              onClick={downloadVCard}
              className="w-1/2 flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Get Contact
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
