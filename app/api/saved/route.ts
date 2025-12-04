import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { PostService } from "@/services/posts";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { paginationQuerySchema } from "@/types/common";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { searchParams } = new URL(request.url);

    // Validate pagination parameters
    const parseResult = paginationQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const { limit, offset } = parseResult.data;

    const posts = await PostService.getSavedPosts(userId, {
      limit,
      offset,
    });

    return createSuccessResponse({ posts });
  } catch (error) {
    console.error("Get saved posts error:", error);
    return createErrorResponse("Failed to get saved posts", 500);
  }
}
