"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { BlueskyPost } from "@/types/bluesky";

export type PostType = "posts" | "replies" | "reposts";

interface BlueskyContextType {
  activeFilters: Set<PostType>;
  isChronological: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  } | null;
  visiblePostUris: Set<string>;
  toggleFilter: (type: PostType) => void;
  toggleChronological: () => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  updateFilteredThreads: (threads: [string, BlueskyPost[]][]) => void;
  registerPostElement: (element: HTMLElement) => void;
  unregisterPostElement: (element: HTMLElement) => void;
}

const BlueskyContext = createContext<BlueskyContextType | undefined>(undefined);

export function BlueskyProvider({ children }: { children: ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<Set<PostType>>(new Set());
  const [isChronological, setIsChronological] = useState(false);
  const [dateRange, setDateRangeState] = useState<{
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [visiblePostUris, setVisiblePostUris] = useState<Set<string>>(
    new Set()
  );
  const lastFilteredThreadsRef = useRef<[string, BlueskyPost[]][]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<HTMLElement>>(new Set());

  const toggleFilter = (type: PostType) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const toggleChronological = () => {
    setIsChronological(!isChronological);
  };

  const setDateRange = (startDate: Date, endDate: Date) => {
    setDateRangeState({ startDate, endDate });
  };

  const updateFilteredThreads = (threads: [string, BlueskyPost[]][]) => {
    // Only update if the threads have actually changed
    if (
      JSON.stringify(threads) !== JSON.stringify(lastFilteredThreadsRef.current)
    ) {
      lastFilteredThreadsRef.current = threads;
    }
  };

  // Initialize intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const newVisibleUris = new Set(visiblePostUris);
        let hasChanges = false;

        entries.forEach((entry) => {
          const postElement = entry.target as HTMLElement;
          const uri = postElement.dataset.uri;
          if (uri) {
            if (entry.isIntersecting) {
              if (!newVisibleUris.has(uri)) {
                newVisibleUris.add(uri);
                hasChanges = true;
              }
            } else {
              if (newVisibleUris.has(uri)) {
                newVisibleUris.delete(uri);
                hasChanges = true;
              }
            }
          }
        });

        if (hasChanges) {
          setVisiblePostUris(newVisibleUris);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const registerPostElement = (element: HTMLElement) => {
    if (observerRef.current && !observedElementsRef.current.has(element)) {
      observerRef.current.observe(element);
      observedElementsRef.current.add(element);
    }
  };

  const unregisterPostElement = (element: HTMLElement) => {
    if (observerRef.current && observedElementsRef.current.has(element)) {
      observerRef.current.unobserve(element);
      observedElementsRef.current.delete(element);
    }
  };

  return (
    <BlueskyContext.Provider
      value={{
        activeFilters,
        isChronological,
        dateRange,
        visiblePostUris,
        toggleFilter,
        toggleChronological,
        setDateRange,
        updateFilteredThreads,
        registerPostElement,
        unregisterPostElement,
      }}
    >
      {children}
    </BlueskyContext.Provider>
  );
}

export function useBluesky() {
  const context = useContext(BlueskyContext);
  if (context === undefined) {
    throw new Error("useBluesky must be used within a BlueskyProvider");
  }
  return context;
}
