/**
 * /api/messages/unread-count
 * Feature: 015-direct-messaging
 *
 * GET - Get total unread message count for the user
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { MessagingService } from "@/services/messaging";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

/**
 * GET /api/messages/unread-count
 *
 * Get total unread message count across all conversations.
 * Used for the header badge display.
 *
 * Response: { count: number }
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const count = await MessagingService.getUnreadCount(userId);

    return createSuccessResponse({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
