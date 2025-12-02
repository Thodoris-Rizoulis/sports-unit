import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { AnalyticsService } from "@/services/analytics";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import type { ProfileVisitResponse } from "@/types/analytics";

/**
 * POST /api/profile/[uuid]/visit
 * Records a profile visit from the authenticated user
 *
 * Requirements:
 * - Must be authenticated
 * - Cannot record self-visits
 * - Non-blocking (returns success even if recording fails)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid } = await params;
    const visitorId = parseInt(session.user.id, 10);

    // Get the visited user's ID from their UUID
    const visitedId = await AnalyticsService.getUserIdByPublicUuid(uuid);
    if (!visitedId) {
      return createErrorResponse("Profile not found", 404);
    }

    // Record the visit (non-blocking - always returns success)
    const recorded = await AnalyticsService.recordProfileVisit(
      visitorId,
      visitedId
    );

    const response: ProfileVisitResponse = {
      success: true,
      recorded,
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error("Failed to record profile visit:", error);
    // Return success anyway - visit recording is non-critical
    const response: ProfileVisitResponse = {
      success: true,
      recorded: false,
    };
    return createSuccessResponse(response);
  }
}
