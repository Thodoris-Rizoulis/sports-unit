import { z } from "zod";

// ========================================
// Profile Analytics Schemas
// ========================================

/**
 * Schema for profile analytics data returned by the API
 */
export const profileAnalyticsSchema = z.object({
  profileViews: z.number().int().nonnegative(),
  postImpressions: z.number().int().nonnegative(),
  periodDays: z.number().int().positive(),
});

/**
 * Schema for profile visit recording response
 */
export const profileVisitResponseSchema = z.object({
  success: z.boolean(),
  recorded: z.boolean(),
});

// ========================================
// Types (inferred from schemas)
// ========================================

export type ProfileAnalyticsData = z.infer<typeof profileAnalyticsSchema>;
export type ProfileVisitResponse = z.infer<typeof profileVisitResponseSchema>;
