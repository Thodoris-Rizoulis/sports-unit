import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { HashtagService } from "@/services/hashtags";
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from "@/lib/api-utils";

/**
 * GET /api/hashtags/popular
 * Returns the top 5 most-used hashtags from the last 7 days
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    // Fetch popular hashtags (last 7 days, top 5)
    const hashtags = await HashtagService.getPopularHashtags(7, 5);

    return createSuccessResponse({ hashtags });
  } catch (error) {
    return handleApiError(error);
  }
}
