import { useInfiniteQuery } from "@tanstack/react-query";
import type { Post } from "@/types/prisma";

export const userPostsKey = (uuid: string) => ["userPosts", uuid];

type UserPostsResponse = {
  posts: Post[];
  hasMore: boolean;
};

/**
 * Hook to fetch posts for a user with infinite scroll support
 */
export function useUserPosts(uuid: string | undefined, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: userPostsKey(uuid!),
    queryFn: async ({ pageParam = 0 }): Promise<UserPostsResponse> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(
          uuid!
        )}/posts?limit=${limit}&offset=${pageParam}`
      );
      if (!res.ok) throw new Error("Failed to fetch user posts");
      return res.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
    enabled: !!uuid,
  });
}

/**
 * Hook to fetch only the 2 most recent posts for Recent Activity section
 */
export function useRecentPosts(uuid: string | undefined) {
  return useInfiniteQuery({
    queryKey: [...userPostsKey(uuid!), "recent"],
    queryFn: async (): Promise<UserPostsResponse> => {
      const res = await fetch(
        `/api/profile/${encodeURIComponent(uuid!)}/posts?limit=2&offset=0`
      );
      if (!res.ok) throw new Error("Failed to fetch recent posts");
      return res.json();
    },
    getNextPageParam: () => undefined, // No pagination for recent posts
    initialPageParam: 0,
    enabled: !!uuid,
  });
}
