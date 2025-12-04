"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { Post } from "@/types/prisma";
import { PostItem } from "./PostItem";
import { usePostFeed, useDeletePost, useUpdatePost } from "@/hooks/usePosts";
import {
  PostFeedSkeleton,
  InlineLoading,
} from "@/components/ui/loading-skeletons";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostFeedProps {
  refreshTrigger?: number;
  feedType?: "feed" | "saved";
  optimisticPosts?: Post[];
  onPostUnsaved?: (postId: number) => void;
  onPostDeleted?: (postId: number) => void;
  excludePostIds?: Set<number>;
}

export function PostFeed({
  refreshTrigger,
  feedType = "feed",
  optimisticPosts = [],
  onPostUnsaved,
  onPostDeleted,
  excludePostIds = new Set(),
}: PostFeedProps) {
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = usePostFeed(feedType);

  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();

  // Flatten all pages into a single posts array
  const posts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts);
  }, [data?.pages]);

  // Filter out excluded posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => !excludePostIds.has(post.id));
  }, [posts, excludePostIds]);

  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Refetch when refresh trigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handlePostDeleted = useCallback(
    (postId: number) => {
      deletePostMutation.mutate(postId);
      onPostDeleted?.(postId);
    },
    [deletePostMutation, onPostDeleted]
  );

  const handlePostUpdated = useCallback(
    (updatedPost: Post) => {
      updatePostMutation.mutate({
        postId: updatedPost.id,
        data: { content: updatedPost.content ?? "" },
      });
    },
    [updatePostMutation]
  );

  // Loading state
  if (isLoading) {
    return <PostFeedSkeleton count={5} />;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-foreground">Failed to load posts</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredPosts.length === 0 && optimisticPosts.length === 0) {
    const emptyMessage =
      feedType === "saved"
        ? "No saved posts yet. Save some posts to see them here!"
        : "No posts yet. Be the first to post!";
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Optimistic posts (newly created, shown at top) */}
      {optimisticPosts.map((post) => (
        <PostItem
          key={`optimistic-${post.id}`}
          post={post}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
        />
      ))}

      {/* Fetched posts */}
      {filteredPosts.map((post) => (
        <PostItem
          key={`fetched-${post.id}`}
          post={post}
          onPostUnsaved={
            onPostUnsaved ? () => onPostUnsaved(post.id) : undefined
          }
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-1" />

      {/* Loading more indicator */}
      {isFetchingNextPage && <InlineLoading />}

      {/* End of feed indicator */}
      {!hasNextPage && filteredPosts.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          You've reached the end
        </div>
      )}
    </div>
  );
}
