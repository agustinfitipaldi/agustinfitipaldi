"use client";

import { useState, useEffect } from "react";
import katex from "katex";
import { Input } from "@/components/ui/input";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MathInput({ value, onChange }: MathInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayHtml, setDisplayHtml] = useState("");

  useEffect(() => {
    try {
      setDisplayHtml(
        katex.renderToString(value, {
          throwOnError: false,
          displayMode: false,
        })
      );
    } catch {
      setDisplayHtml(value);
    }
  }, [value]);

  if (isEditing) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setIsEditing(false);
          }
        }}
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="p-2 border rounded-md bg-background cursor-text min-h-[40px] flex items-center"
      dangerouslySetInnerHTML={{ __html: displayHtml }}
    />
  );
}
