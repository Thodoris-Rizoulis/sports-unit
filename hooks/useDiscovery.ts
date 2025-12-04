import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import type {
  DiscoveryResponse,
  DiscoveryFiltersInput,
} from "@/types/discovery";

/**
 * Fetch discovery results from API
 */
async function fetchDiscoveryResults(
  params: URLSearchParams
): Promise<DiscoveryResponse> {
  const res = await fetch(`/api/discovery?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch discovery results");
  }
  const data = await res.json();
  // API returns the data directly, not wrapped in { data: ... }
  return data as DiscoveryResponse;
}

/**
 * Hook for managing discovery state and fetching results.
 * Reads filter state from URL search params.
 */
export function useDiscovery() {
  const searchParams = useSearchParams();

  // Build params object for the query key
  const paramsObject: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    paramsObject[key] = value;
  });

  const query = useQuery({
    queryKey: ["discovery", paramsObject],
    queryFn: () => fetchDiscoveryResults(searchParams),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
  });

  // Parse current filters from URL
  const currentFilters: DiscoveryFiltersInput = {};

  // String params
  const sportId = searchParams.get("sportId");
  if (sportId) currentFilters.sportId = Number(sportId);

  // Multi-value params (comma-separated)
  const positionIds = searchParams.get("positionIds");
  if (positionIds) {
    currentFilters.positionIds = positionIds
      .split(",")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
  }

  const strongFoot = searchParams.get("strongFoot");
  if (strongFoot)
    currentFilters.strongFoot = strongFoot as "right" | "left" | "both";

  const openToOpportunities = searchParams.get("openToOpportunities");
  // Only count openToOpportunities when explicitly true
  if (openToOpportunities === "true") currentFilters.openToOpportunities = true;

  const location = searchParams.get("location");
  if (location) currentFilters.location = location;

  // Number params
  const numericParams = [
    "heightMin",
    "heightMax",
    "ageMin",
    "ageMax",
    "sprintSpeed30mMin",
    "sprintSpeed30mMax",
    "agilityTTestMin",
    "agilityTTestMax",
    "beepTestLevelMin",
    "beepTestLevelMax",
    "verticalJumpMin",
    "verticalJumpMax",
  ] as const;

  for (const param of numericParams) {
    const value = searchParams.get(param);
    if (value) {
      (currentFilters as Record<string, unknown>)[param] = Number(value);
    }
  }

  // Pagination
  const page = searchParams.get("page");
  const currentPage = page ? Number(page) : 1;

  const sort = searchParams.get("sort") || "recent";

  // Count active filters (excluding sort and page)
  const activeFilterCount = Object.keys(currentFilters).length;

  return {
    athletes: query.data?.athletes || [],
    pagination: query.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    currentFilters,
    currentPage,
    currentSort: sort,
    activeFilterCount,
  };
}
