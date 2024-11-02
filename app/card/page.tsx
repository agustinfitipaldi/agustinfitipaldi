"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Home } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { useToast } from "@/hooks/use-toast";

// Add these type definitions
interface NDEFRecord {
  recordType: string;
  data: string | ArrayBuffer | DataView;
  encoding?: string;
  lang?: string;
}

interface NDEFMessage {
  records: NDEFRecord[];
}

// Add to your existing type definitions
interface PermissionDescriptor {
  name: "nfc";
}

interface PermissionStatus {
  state: "granted" | "denied" | "prompt";
}

declare global {
  interface Permissions {
    query(descriptor: PermissionDescriptor): Promise<PermissionStatus>;
  }
  interface Window {
    NDEFReader: {
      new (): {
        write: (message: NDEFMessage) => Promise<void>;
        scan: () => Promise<void>;
      };
    };
  }
}

export default function BusinessCard() {
  const [orientation, setOrientation] = useState("portrait");
  const [nfcSupported, setNfcSupported] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    // Check if Web NFC is supported
    if ("NDEFReader" in window) {
      setNfcSupported(true);
    }
  }, []);

  const shareViaNFC = async () => {
    try {
      setNfcStatus("loading");
      setErrorMessage("");

      // Check NFC permission
      const permission = await (navigator.permissions as Permissions).query({
        name: "nfc",
      });
      if (permission.state === "denied") {
        throw new Error("NFC permission denied");
      }

      const ndef = new window.NDEFReader();

      // Optional: You can skip scan if writing to a tag
      // await ndef.scan();

      // Prepare the contact information as a URL or vCard
      const contactURL = `${window.location.origin}/contact.vcf`;

      await ndef.write({
        records: [
          {
            recordType: "url",
            data: contactURL, // Link to a vCard file or contact page
          },
        ],
      });

      setNfcStatus("ready");
      toast({
        title: "Success!",
        description: "Contact information written to NFC tag successfully",
      });
      setTimeout(() => setNfcStatus("idle"), 3000);
    } catch (error) {
      console.error("NFC Error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(errorMsg);
      setNfcStatus("error");

      toast({
        variant: "destructive",
        title: "NFC Error",
        description: errorMsg,
      });

      setTimeout(() => {
        setNfcStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
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

    handleOrientationChange(); // Initial check
    window.addEventListener("resize", handleOrientationChange);
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  return (
    <main className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
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

          {/* Add this before the "Back to Home" button */}
          {nfcSupported && (
            <>
              <Button
                variant="outline"
                onClick={shareViaNFC}
                className="w-full mb-2 relative"
                disabled={nfcStatus === "loading" || nfcStatus === "ready"}
              >
                {nfcStatus === "loading" && (
                  <span className="mr-2 animate-spin">⭕</span>
                )}
                {nfcStatus === "ready" && <span className="mr-2">✅</span>}
                {nfcStatus === "error" && <span className="mr-2">❌</span>}
                {nfcStatus === "idle" && <span className="mr-2">📱</span>}
                {nfcStatus === "loading"
                  ? "Preparing NFC..."
                  : nfcStatus === "ready"
                  ? "Ready! Tap device"
                  : nfcStatus === "error"
                  ? "Error - Try again"
                  : "Share via NFC"}
              </Button>
              {errorMessage && (
                <p className="text-sm text-destructive mb-2">{errorMessage}</p>
              )}
            </>
          )}

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
