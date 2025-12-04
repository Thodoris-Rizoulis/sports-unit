/**
 * GET /api/notifications/unread-count
 *
 * Returns the count of unread notifications for the authenticated user.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { NotificationService } from "@/services/notifications";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const count = await NotificationService.getUnreadCount(userId);

    return createSuccessResponse({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
