import { useQuery } from "@tanstack/react-query";
import type {
  WatchlistSummary,
  WatchlistAthleteItem,
} from "@/types/watchlists";

type WatchlistDetail = {
  watchlist: WatchlistSummary;
  athletes: WatchlistAthleteItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Fetch a single watchlist with its athletes
 */
async function fetchWatchlist(
  id: number,
  page: number = 1,
  limit: number = 20
): Promise<WatchlistDetail> {
  const res = await fetch(`/api/watchlists/${id}?page=${page}&limit=${limit}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Watchlist not found");
    }
    throw new Error("Failed to fetch watchlist");
  }
  const data = await res.json();
  // API returns the data directly, not wrapped in { data: ... }
  return data as WatchlistDetail;
}

/**
 * Hook for fetching a single watchlist with its athletes
 */
export function useWatchlist(
  id: number | null,
  page: number = 1,
  limit: number = 20
) {
  const query = useQuery({
    queryKey: ["watchlist", id, page, limit],
    queryFn: () => fetchWatchlist(id!, page, limit),
    enabled: id !== null,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    watchlist: query.data?.watchlist || null,
    athletes: query.data?.athletes || [],
    pagination: {
      total: query.data?.total || 0,
      page: query.data?.page || 1,
      limit: query.data?.limit || 20,
      totalPages: query.data?.totalPages || 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
