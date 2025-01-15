"use client";

import { useEffect } from "react";

export function FootnoteEnhancer() {
  useEffect(() => {
    const handleFootnoteClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Handle return from footnote to reference
      if (target.matches(".data-footnote-backref")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        const footnoteRef = document.querySelector(href as string);

        if (footnoteRef) {
          // Get the viewport height
          const viewportHeight = window.innerHeight;
          // Get the element's position
          const rect = footnoteRef.getBoundingClientRect();
          // Calculate scroll position to center the element
          const scrollTo = window.scrollY + rect.top - viewportHeight / 2;

          // Smooth scroll
          window.scrollTo({
            top: scrollTo,
            behavior: "smooth",
          });

          // Flash effect on the number in the text
          footnoteRef.classList.add("flash-highlight");
          setTimeout(() => {
            footnoteRef.classList.remove("flash-highlight");
          }, 1500);
        }
      }

      // Handle click from reference to footnote
      if (target.matches("sup a[id^='fnref']")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (!href) return;

        const footnote = document.querySelector(href);
        if (!footnote) return;

        // Get the viewport height
        const viewportHeight = window.innerHeight;
        // Get the element's position
        const rect = footnote.getBoundingClientRect();
        // Calculate scroll position to center the element
        const scrollTo = window.scrollY + rect.top - viewportHeight / 2;

        // Smooth scroll
        window.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });

        // Find and highlight the footnote number
        const footnoteNumber = footnote.querySelector("sup");
        if (footnoteNumber) {
          footnoteNumber.classList.add("flash-highlight");
          setTimeout(() => {
            footnoteNumber.classList.remove("flash-highlight");
          }, 1500);
        }
      }
    };

    document.addEventListener("click", handleFootnoteClick);
    return () => document.removeEventListener("click", handleFootnoteClick);
  }, []);

  return null;
}
