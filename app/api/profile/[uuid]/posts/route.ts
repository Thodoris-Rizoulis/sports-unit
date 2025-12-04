import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { PostService } from "@/services/posts";

/**
 * GET /api/profile/[uuid]/posts
 * Get posts for a user with pagination
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

    // Get current user for isLiked/isSaved status
    const session = await getServerSession(authOptions);
    const currentUserId = getSessionUserId(session) ?? undefined;

    // Get query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get user's posts
    const posts = await PostService.getUserPosts(userId, currentUserId, {
      limit,
      offset,
    });

    return createSuccessResponse({
      posts,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    return createErrorResponse("Failed to get user posts", 500);
  }
}
