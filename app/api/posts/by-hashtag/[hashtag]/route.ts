import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { HashtagService } from "@/services/hashtags";
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from "@/lib/api-utils";
import { hashtagPostsQuerySchema, hashtagNameSchema } from "@/types/posts";

type RouteParams = {
  params: Promise<{ hashtag: string }>;
};

/**
 * GET /api/posts/by-hashtag/[hashtag]
 * Returns paginated posts containing a specific hashtag
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = Number(session.user.id);
    const { hashtag: hashtagParam } = await params;

    // Validate hashtag path parameter
    const hashtagResult = hashtagNameSchema.safeParse(hashtagParam);
    if (!hashtagResult.success) {
      return createErrorResponse("Invalid hashtag format", 400);
    }
    const hashtag = hashtagResult.data;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = hashtagPostsQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      cursor: searchParams.get("cursor") ?? undefined,
    });

    if (!queryResult.success) {
      return createErrorResponse("Invalid query parameters", 400);
    }

    const { limit, cursor } = queryResult.data;

    // Fetch posts by hashtag
    const result = await HashtagService.getPostsByHashtag(
      hashtag,
      userId,
      cursor,
      limit
    );

    return createSuccessResponse({
      hashtag,
      posts: result.posts,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
