/**
 * /api/messages/recent
 * Feature: 015-direct-messaging
 *
 * GET - Get recent messages for the header dropdown
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { MessagingService } from "@/services/messaging";
import { getRecentMessagesSchema } from "@/types/messaging";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

/**
 * GET /api/messages/recent
 *
 * Get recent messages from other users across all conversations.
 * Used for the header inbox dropdown preview.
 *
 * Query Parameters:
 * - limit: number (optional, default 10, max 100)
 *
 * Response: { messages: RecentMessageUI[] }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const parseResult = getRecentMessagesSchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const userId = requireSessionUserId(session);
    const messages = await MessagingService.getRecentMessages(
      userId,
      parseResult.data.limit
    );

    return createSuccessResponse({ messages });
  } catch (error) {
    console.error("Error fetching recent messages:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
