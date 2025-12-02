import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { AnalyticsService } from "@/services/analytics";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

/**
 * GET /api/profile/analytics
 * Returns profile analytics for the authenticated user
 *
 * Query params:
 * - periodDays: number (optional, default: 7)
 *
 * Returns:
 * - profileViews: unique visitors in the period
 * - postImpressions: likes received in the period
 * - periodDays: the period used for the calculation
 */
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id, 10);

    // Parse optional periodDays query param
    const { searchParams } = new URL(request.url);
    const periodDaysParam = searchParams.get("periodDays");
    const periodDays = periodDaysParam ? parseInt(periodDaysParam, 10) : 7;

    // Validate periodDays
    if (isNaN(periodDays) || periodDays < 1 || periodDays > 365) {
      return createErrorResponse(
        "Invalid periodDays: must be between 1 and 365",
        400
      );
    }

    // Get analytics data
    const analytics = await AnalyticsService.getProfileAnalytics(
      userId,
      periodDays
    );

    return createSuccessResponse(analytics);
  } catch (error) {
    console.error("Failed to fetch profile analytics:", error);
    return createErrorResponse("Failed to fetch analytics", 500);
  }
}
