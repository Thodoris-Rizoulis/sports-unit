import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Post } from "@/types/prisma";

// ========================================
// Query Keys
// ========================================

export const postKeys = {
  all: ["posts"] as const,
  feed: () => [...postKeys.all, "feed"] as const,
  saved: () => [...postKeys.all, "saved"] as const,
  user: (userId: number) => [...postKeys.all, "user", userId] as const,
  detail: (id: number) => [...postKeys.all, "detail", id] as const,
};

// ========================================
// Types
// ========================================

type FeedResponse = {
  posts: Post[];
};

type FeedType = "feed" | "saved";

// ========================================
// API Functions
// ========================================

async function fetchFeed(
  feedType: FeedType,
  limit: number,
  offset: number
): Promise<FeedResponse> {
  const endpoint = feedType === "saved" ? "/api/saved" : "/api/posts";
  const response = await fetch(`${endpoint}?limit=${limit}&offset=${offset}`);

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
}

async function deletePost(postId: number): Promise<void> {
  const response = await fetch(`/api/posts/${postId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
}

async function updatePost(
  postId: number,
  data: { content: string; media?: Array<{ type: string; file: string }> }
): Promise<Post> {
  const response = await fetch(`/api/posts/${postId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update post");
  }

  const result = await response.json();
  return result.post;
}

// ========================================
// Hooks
// ========================================

/**
 * Hook for fetching paginated post feed using React Query infinite queries
 */
export function usePostFeed(feedType: FeedType = "feed", limit: number = 20) {
  return useInfiniteQuery({
    queryKey: feedType === "saved" ? postKeys.saved() : postKeys.feed(),
    queryFn: ({ pageParam = 0 }) => fetchFeed(feedType, limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If we got fewer posts than requested, there's no more data
      if (lastPage.posts.length < limit) {
        return undefined;
      }
      // Calculate next offset based on total posts fetched
      return allPages.reduce((total, page) => total + page.posts.length, 0);
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook for deleting a post with optimistic update
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(postKeys.feed());
      const previousSaved = queryClient.getQueryData(postKeys.saved());

      // Optimistically remove post from feed
      queryClient.setQueryData(postKeys.feed(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.filter((post: Post) => post.id !== postId),
          })),
        };
      });

      // Optimistically remove from saved
      queryClient.setQueryData(postKeys.saved(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.filter((post: Post) => post.id !== postId),
          })),
        };
      });

      return { previousFeed, previousSaved };
    },
    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(postKeys.feed(), context.previousFeed);
      }
      if (context?.previousSaved) {
        queryClient.setQueryData(postKeys.saved(), context.previousSaved);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook for updating a post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: { content: string; media?: Array<{ type: string; file: string }> };
    }) => updatePost(postId, data),
    onSuccess: (updatedPost) => {
      // Update post in all caches
      const updatePostInPages = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            posts: page.posts.map((post: Post) =>
              post.id === updatedPost.id ? updatedPost : post
            ),
          })),
        };
      };

      queryClient.setQueryData(postKeys.feed(), updatePostInPages);
      queryClient.setQueryData(postKeys.saved(), updatePostInPages);
    },
  });
}

/**
 * Add a new post to the feed (for optimistic updates after creation)
 */
export function useAddPostToFeed() {
  const queryClient = useQueryClient();

  return (newPost: Post) => {
    queryClient.setQueryData(postKeys.feed(), (old: any) => {
      if (!old) return { pages: [{ posts: [newPost] }], pageParams: [0] };
      return {
        ...old,
        pages: [
          { posts: [newPost, ...old.pages[0].posts] },
          ...old.pages.slice(1),
        ],
      };
    });
  };
}
