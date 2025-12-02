import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { AthleteMetricsService } from "@/services/athlete-metrics";
import { athleteMetricsSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/metrics
 * Get athlete metrics for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    const metrics = await AthleteMetricsService.get(userId);

    return createSuccessResponse({ metrics });
  } catch (error) {
    console.error("Get athlete metrics error:", error);
    return createErrorResponse("Failed to get athlete metrics", 500);
  }
}

/**
 * PUT /api/profile/[uuid]/metrics
 * Update athlete metrics (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== parseInt(session.user.id)) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = athleteMetricsSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const metrics = await AthleteMetricsService.upsert(
      userId,
      validationResult.data
    );

    return createSuccessResponse({ metrics });
  } catch (error) {
    console.error("Update athlete metrics error:", error);
    return createErrorResponse("Failed to update athlete metrics", 500);
  }
}
