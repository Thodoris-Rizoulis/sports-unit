import { z } from "zod";
import { VALIDATION_CONSTANTS } from "@/lib/constants";

// ========================================
// Discovery Filter Schemas (Input Validation)
// ========================================

// Sort options for discovery results
export const discoverySortOptions = [
  "recent",
  "alphabetical",
  "newest",
] as const;
export type DiscoverySortOption = (typeof discoverySortOptions)[number];

// Strong foot options for filtering
export const strongFootOptions = VALIDATION_CONSTANTS.STRONG_FOOT_OPTIONS;

/**
 * Schema for discovery filter query parameters
 * All fields are optional - empty filters return all athletes (paginated)
 */
export const discoveryFiltersSchema = z.object({
  // Profile attributes
  sportId: z.coerce.number().int().positive().optional(),
  // Support multiple positions (comma-separated in URL, parsed as array)
  positionIds: z
    .union([
      z.array(z.coerce.number().int().positive()),
      z.coerce
        .number()
        .int()
        .positive()
        .transform((v) => [v]),
      z.string().transform((v) =>
        v
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id) && id > 0)
      ),
    ])
    .optional(),
  strongFoot: z.enum(strongFootOptions).optional(),
  openToOpportunities: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
  location: z.string().max(255).optional(),

  // Height range (cm)
  heightMin: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM)
    .max(VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM)
    .optional(),
  heightMax: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MIN_CM)
    .max(VALIDATION_CONSTANTS.PHYSICAL.HEIGHT_MAX_CM)
    .optional(),

  // Age range (years) - calculated from dateOfBirth
  ageMin: z.coerce.number().int().min(10).max(100).optional(),
  ageMax: z.coerce.number().int().min(10).max(100).optional(),

  // Athlete metrics - Sprint Speed 30m (seconds, lower is better)
  sprintSpeed30mMin: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MAX)
    .optional(),
  sprintSpeed30mMax: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.SPRINT_SPEED_30M.MAX)
    .optional(),

  // Agility T-Test (seconds, lower is better)
  agilityTTestMin: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MAX)
    .optional(),
  agilityTTestMax: z.coerce
    .number()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.AGILITY_T_TEST.MAX)
    .optional(),

  // Beep Test Level (higher is better)
  beepTestLevelMin: z.coerce
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MAX)
    .optional(),
  beepTestLevelMax: z.coerce
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.BEEP_TEST_LEVEL.MAX)
    .optional(),

  // Vertical Jump (cm, higher is better)
  verticalJumpMin: z.coerce
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MAX)
    .optional(),
  verticalJumpMax: z.coerce
    .number()
    .int()
    .min(VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MIN)
    .max(VALIDATION_CONSTANTS.ATHLETE_METRICS.VERTICAL_JUMP.MAX)
    .optional(),

  // Sorting and pagination
  sort: z.enum(discoverySortOptions).default("recent"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type DiscoveryFiltersInput = z.input<typeof discoveryFiltersSchema>;
export type DiscoveryFilters = z.output<typeof discoveryFiltersSchema>;

// ========================================
// Discovery Response Types (Output)
// ========================================

/**
 * Athlete metrics for discovery card display
 */
export type AthleteDiscoveryMetrics = {
  sprintSpeed30m: number | null;
  agilityTTest: number | null;
  beepTestLevel: number | null;
  beepTestShuttle: number | null;
  verticalJump: number | null;
};

/**
 * Athlete result in discovery search
 * Includes all data needed for AthleteCard display
 */
export type AthleteDiscoveryResult = {
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
  inWatchlistIds: number[]; // IDs of current user's watchlists containing this athlete
};

/**
 * Pagination info for discovery results
 */
export type DiscoveryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

/**
 * Discovery API response
 */
export type DiscoveryResponse = {
  athletes: AthleteDiscoveryResult[];
  pagination: DiscoveryPagination;
};
