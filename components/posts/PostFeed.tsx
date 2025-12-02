"use client";

import { useEffect, useState, useCallback } from "react";
import { Post } from "@/types/prisma";
import { PostItem } from "./PostItem";
import { Skeleton } from "@/components/ui/skeleton";

interface PostFeedProps {
  refreshTrigger?: number;
  feedType?: "feed" | "saved";
  optimisticPosts?: Post[];
  onPostUnsaved?: (postId: number) => void;
  excludePostIds?: Set<number>;
}

export function PostFeed({
  refreshTrigger,
  feedType = "feed",
  optimisticPosts = [],
  onPostUnsaved,
  excludePostIds = new Set(),
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchPosts = useCallback(
    async (loadMore = false) => {
      try {
        if (loadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const currentOffset = loadMore ? offset : 0;
        const endpoint = feedType === "saved" ? "/api/saved" : "/api/posts";
        const response = await fetch(
          `${endpoint}?limit=${limit}&offset=${currentOffset}`
        );
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();

        if (loadMore) {
          setPosts((prev) => [...prev, ...data.posts]);
          setOffset((prev) => prev + data.posts.length);
          setHasMore(data.posts.length === limit);
        } else {
          setPosts(data.posts);
          setOffset(data.posts.length);
          setHasMore(data.posts.length === limit);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, feedType, limit]
  );

  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when user is 200px from bottom
    if (scrollTop + windowHeight >= documentHeight - 200) {
      fetchPosts(true);
    }
  }, [loadingMore, hasMore, fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [refreshTrigger, feedType, fetchPosts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="border rounded-lg p-6 bg-card/50 backdrop-blur-sm"
          >
            <div className="flex items-start space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="flex space-x-4 pt-3">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div>Error: {error}</div>;
  if (posts.length === 0) {
    const emptyMessage =
      feedType === "saved"
        ? "No saved posts yet. Save some posts to see them here!"
        : "No posts yet. Be the first to post!";
    return <div>{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      {optimisticPosts.map((post) => (
        <PostItem key={`optimistic-${post.id}`} post={post} />
      ))}
      {posts
        .filter((post) => !excludePostIds.has(post.id))
        .map((post) => (
          <PostItem
            key={`fetched-${post.id}`}
            post={post}
            onPostUnsaved={
              onPostUnsaved ? () => onPostUnsaved(post.id) : undefined
            }
          />
        ))}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="flex space-x-2">
            <Skeleton className="h-4 w-4 rounded-full animate-bounce" />
            <Skeleton
              className="h-4 w-4 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <Skeleton
              className="h-4 w-4 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
