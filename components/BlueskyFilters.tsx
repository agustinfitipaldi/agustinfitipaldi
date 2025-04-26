"use client";

import { Button } from "@/components/ui/button";
import { Clock, CalendarDays } from "lucide-react";
import { useBluesky, PostType } from "@/contexts/BlueskyContext";

interface BlueskyFiltersProps {
  postCounts: Record<PostType, number>;
}

export default function BlueskyFilters({ postCounts }: BlueskyFiltersProps) {
  const { activeFilters, isChronological, toggleFilter, toggleChronological } =
    useBluesky();

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div className="flex gap-2 flex-wrap">
        {(["posts", "replies", "reposts"] as PostType[]).map((type) => (
          <Button
            key={type}
            variant={activeFilters.has(type) ? "default" : "secondary"}
            size="sm"
            onClick={() => toggleFilter(type)}
            className="text-xs"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
            <span className="text-muted-foreground ml-1">
              {postCounts[type]}
            </span>
          </Button>
        ))}
      </div>
      <Button
        variant={isChronological ? "default" : "secondary"}
        size="sm"
        onClick={toggleChronological}
        className="flex items-center gap-2 w-full sm:w-auto justify-center"
      >
        {isChronological ? (
          <Clock className="h-4 w-4" />
        ) : (
          <CalendarDays className="h-4 w-4" />
        )}
        {isChronological ? "Chronological" : "Latest"}
      </Button>
    </div>
  );
}
