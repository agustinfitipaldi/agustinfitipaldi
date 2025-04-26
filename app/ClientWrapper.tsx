"use client";

import { useEffect } from "react";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Remove any attributes added by browser extensions
    const body = document.body;
    const attributes = body.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (attr.name.startsWith("data-")) {
        body.removeAttribute(attr.name);
      }
    }
  }, []);

  return <>{children}</>;
}
