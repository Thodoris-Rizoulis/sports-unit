/**
 * POST /api/notifications/mark-read
 *
 * Mark all notifications as read for the authenticated user.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { NotificationService } from "@/services/notifications";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const markedCount = await NotificationService.markAllAsRead(userId);

    return createSuccessResponse({
      success: true,
      markedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
