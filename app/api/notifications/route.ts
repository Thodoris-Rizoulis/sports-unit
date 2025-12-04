/**
 * GET /api/notifications
 *
 * Fetch paginated notifications for the authenticated user.
 * Supports grouping of similar notifications (likes on same post, etc.)
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { NotificationService } from "@/services/notifications";
import { getNotificationsQuerySchema } from "@/types/notifications";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const parseResult = getNotificationsQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? 15,
      cursor: searchParams.get("cursor") ?? undefined,
      grouped: searchParams.get("grouped") ?? true,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const { limit, cursor, grouped } = parseResult.data;

    const result = await NotificationService.getByUserId(userId, {
      limit,
      cursor,
      grouped,
    });

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
