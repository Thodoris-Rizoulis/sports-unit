import { useQuery } from "@tanstack/react-query";
import type { WatchlistSummary } from "@/types/watchlists";

/**
 * Fetch all watchlists for current user
 */
async function fetchWatchlists(): Promise<WatchlistSummary[]> {
  const res = await fetch("/api/watchlists");
  if (!res.ok) {
    throw new Error("Failed to fetch watchlists");
  }
  const data = await res.json();
  // API returns the array directly, not wrapped in { data: ... }
  return data as WatchlistSummary[];
}

/**
 * Hook for fetching user's watchlists
 */
export function useWatchlists() {
  const query = useQuery({
    queryKey: ["watchlists"],
    queryFn: fetchWatchlists,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    watchlists: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
