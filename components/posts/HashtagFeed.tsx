"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { PostItem } from "./PostItem";
import { Loader2, Hash } from "lucide-react";
import type { HashtagPostsResponse } from "@/types/prisma";

type HashtagFeedProps = {
  hashtag: string;
};

async function fetchHashtagPosts(
  hashtag: string,
  cursor?: number
): Promise<HashtagPostsResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor.toString());
  params.set("limit", "20");

  const res = await fetch(
    `/api/posts/by-hashtag/${encodeURIComponent(hashtag)}?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
}

export function HashtagFeed({ hashtag }: HashtagFeedProps) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["hashtag-posts", hashtag],
    queryFn: ({ pageParam }) => fetchHashtagPosts(hashtag, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  });

  // Auto-fetch when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg">Failed to load posts</p>
        <p className="text-sm">{error?.message}</p>
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Hash className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No posts found</p>
        <p className="text-sm">
          No posts with #{hashtag} yet. Be the first to post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-4">
          No more posts
        </p>
      )}
    </div>
  );
}
