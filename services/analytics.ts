import prisma from "@/lib/prisma";
import type { ProfileAnalyticsData } from "@/types/analytics";

/**
 * AnalyticsService - Handles profile analytics operations
 * Static class following the project's service pattern
 */
export class AnalyticsService {
  /**
   * Record a profile visit
   * - Does not record self-visits (visitor === visited)
   * - Records all visits (total), unique count is calculated at display time
   *
   * @param visitorId - The ID of the user visiting the profile
   * @param visitedId - The ID of the user whose profile is being visited
   * @returns Whether the visit was recorded
   */
  static async recordProfileVisit(
    visitorId: number,
    visitedId: number
  ): Promise<boolean> {
    // Don't record self-visits
    if (visitorId === visitedId) {
      return false;
    }

    try {
      await prisma.profileVisit.create({
        data: {
          visitorId,
          visitedId,
        },
      });
      return true;
    } catch (error) {
      // Log error but don't fail - visit recording is non-critical
      console.error("Failed to record profile visit:", error);
      return false;
    }
  }

  /**
   * Get profile analytics for a user
   * - Returns unique profile views in the last N days
   * - Returns total post impressions (likes received) in the last N days
   *
   * @param userId - The ID of the user to get analytics for
   * @param periodDays - The number of days to look back (default: 7)
   * @returns ProfileAnalyticsData with view and impression counts
   */
  static async getProfileAnalytics(
    userId: number,
    periodDays: number = 7
  ): Promise<ProfileAnalyticsData> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);

    // Get unique profile views in the period
    // Using raw query for COUNT(DISTINCT) which is more efficient
    const profileViewsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(DISTINCT visitor_id) as count
      FROM profile_visits
      WHERE visited_id = ${userId}
        AND created_at >= ${cutoffDate}
    `;

    const profileViews = Number(profileViewsResult[0]?.count ?? 0);

    // Get post impressions (likes received on user's posts in the period)
    // This counts likes received in the period, regardless of when the post was created
    const postImpressionsResult = await prisma.$queryRaw<
      Array<{ count: bigint }>
    >`
      SELECT COUNT(*) as count
      FROM post_likes pl
      INNER JOIN posts p ON pl.post_id = p.id
      WHERE p.user_id = ${userId}
        AND pl.created_at >= ${cutoffDate}
    `;

    const postImpressions = Number(postImpressionsResult[0]?.count ?? 0);

    return {
      profileViews,
      postImpressions,
      periodDays,
    };
  }

  /**
   * Get the user ID from a public UUID
   * Helper method for the visit API
   *
   * @param publicUuid - The public UUID of the user
   * @returns The user ID or null if not found
   */
  static async getUserIdByPublicUuid(
    publicUuid: string
  ): Promise<number | null> {
    const user = await prisma.user.findUnique({
      where: { publicUuid },
      select: { id: true },
    });
    return user?.id ?? null;
  }
}
