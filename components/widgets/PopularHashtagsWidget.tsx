"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Hash } from "lucide-react";
import type { PopularHashtagsResponse } from "@/types/prisma";

async function fetchPopularHashtags(): Promise<PopularHashtagsResponse> {
  const res = await fetch("/api/hashtags/popular");
  if (!res.ok) {
    throw new Error("Failed to fetch popular hashtags");
  }
  return res.json();
}

export default function PopularHashtagsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["popular-hashtags"],
    queryFn: fetchPopularHashtags,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" />
            Popular Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Error or empty state - don't show widget
  if (isError || !data?.hashtags || data.hashtags.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Popular Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {data.hashtags.map((hashtag) => (
          <Link
            key={hashtag.id}
            href={`/hashtag/${hashtag.name}`}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors group"
          >
            <Hash className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {hashtag.name}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
