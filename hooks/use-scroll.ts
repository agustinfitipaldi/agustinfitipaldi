"use client";

import { useState, useEffect } from "react";

export function useScroll() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [scrolledToTop, setScrolledToTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      setScrolledToTop(scrollY < 10);
      setLastScrollY(scrollY);
    };

    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection, lastScrollY]);

  return { scrollDirection, scrolledToTop };
}
