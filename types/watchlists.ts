import { z } from "zod";
import type { AthleteDiscoveryMetrics } from "./discovery";

// ========================================
// Watchlist Validation Constants
// ========================================

export const WATCHLIST_CONSTANTS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

// ========================================
// Watchlist Input Schemas (Zod)
// ========================================

/**
 * Schema for creating a new watchlist
 */
export const createWatchlistSchema = z.object({
  name: z
    .string()
    .min(WATCHLIST_CONSTANTS.NAME_MIN_LENGTH, "Name is required")
    .max(
      WATCHLIST_CONSTANTS.NAME_MAX_LENGTH,
      `Name must be at most ${WATCHLIST_CONSTANTS.NAME_MAX_LENGTH} characters`
    ),
  description: z
    .string()
    .max(
      WATCHLIST_CONSTANTS.DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${WATCHLIST_CONSTANTS.DESCRIPTION_MAX_LENGTH} characters`
    )
    .optional()
    .nullable(),
});

export type CreateWatchlistInput = z.infer<typeof createWatchlistSchema>;

/**
 * Schema for updating a watchlist (partial)
 */
export const updateWatchlistSchema = createWatchlistSchema.partial();

export type UpdateWatchlistInput = z.infer<typeof updateWatchlistSchema>;

/**
 * Schema for adding an athlete to a watchlist
 */
export const addAthleteToWatchlistSchema = z.object({
  athleteId: z.number().int().positive("Athlete ID is required"),
});

export type AddAthleteToWatchlistInput = z.infer<
  typeof addAthleteToWatchlistSchema
>;

/**
 * Schema for pagination query params on watchlist detail
 */
export const watchlistPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type WatchlistPaginationInput = z.infer<
  typeof watchlistPaginationSchema
>;

// ========================================
// Watchlist Output Types
// ========================================

/**
 * Watchlist summary for list views
 * Includes computed athleteCount
 */
export type WatchlistSummary = {
  id: number;
  name: string;
  description: string | null;
  athleteCount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

/**
 * Watchlist detail (without athletes)
 */
export type WatchlistDetail = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Athlete item in a watchlist
 * Similar to AthleteDiscoveryResult but with addedAt
 */
export type WatchlistAthleteItem = {
  id: number;
  publicUuid: string;
  username: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  location: string | null;
  openToOpportunities: boolean;
  strongFoot: string | null;
  height: number | null;
  age: number | null;
  sportId: number | null;
  sportName: string | null;
  positions: number[] | null;
  metrics: AthleteDiscoveryMetrics | null;
  addedAt: string; // ISO date string - when added to this watchlist
};

/**
 * Pagination info for watchlist athletes
 */
export type WatchlistPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

// ========================================
// API Response Types
// ========================================

/**
 * Response for GET /api/watchlists (list all user's watchlists)
 */
export type WatchlistsListResponse = {
  watchlists: WatchlistSummary[];
};

/**
 * Response for GET /api/watchlists/[id] (single watchlist with athletes)
 */
export type WatchlistDetailResponse = {
  watchlist: WatchlistDetail;
  athletes: WatchlistAthleteItem[];
  pagination: WatchlistPagination;
};

/**
 * Response for POST /api/watchlists (create watchlist)
 * Returns the created watchlist summary
 */
export type CreateWatchlistResponse = WatchlistSummary;

/**
 * Response for PATCH /api/watchlists/[id] (update watchlist)
 */
export type UpdateWatchlistResponse = WatchlistSummary;

/**
 * Response for POST /api/watchlists/[id]/athletes (add athlete)
 */
export type AddAthleteResponse = {
  success: true;
  addedAt: string; // ISO date string
};

/**
 * Response for DELETE operations
 */
export type DeleteResponse = {
  success: true;
};

/**
 * Response for GET /api/watchlists/containing/[athleteId]
 */
export type ContainingWatchlistsResponse = {
  watchlistIds: number[];
};
