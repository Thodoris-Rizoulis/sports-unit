import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { PostService } from "@/services/posts";
import { createPostInputSchema } from "@/types/posts";
import { paginationQuerySchema } from "@/types/common";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    // Get and validate query params
    const url = new URL(request.url);
    const parseResult = paginationQuerySchema.safeParse({
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const { limit, offset } = parseResult.data;

    // Get feed
    const posts = await PostService.getFeed(userId, {
      limit,
      offset,
    });

    return createSuccessResponse({ posts });
  } catch (error) {
    console.error("Get posts error:", error);
    return createErrorResponse("Failed to get posts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    // Parse and validate input
    const body = await request.json();
    const input = createPostInputSchema.parse(body);

    // Create post
    const result = await PostService.createPost(userId, input);

    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error("Create post error:", error);
    return createErrorResponse("Failed to create post", 500);
  }
}
