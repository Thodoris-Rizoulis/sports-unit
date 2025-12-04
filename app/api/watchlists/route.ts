import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { WatchlistService } from "@/services/watchlists";
import { createWatchlistSchema } from "@/types/watchlists";

/**
 * GET /api/watchlists - Get all watchlists for current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const watchlists = await WatchlistService.getUserWatchlists(userId);

    return createSuccessResponse(watchlists);
  } catch (error) {
    console.error("Failed to get watchlists:", error);
    return createErrorResponse("Failed to get watchlists", 500);
  }
}

/**
 * POST /api/watchlists - Create a new watchlist
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const body = await req.json();

    // Validate input
    const validationResult = createWatchlistSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const watchlist = await WatchlistService.createWatchlist(
      userId,
      validationResult.data
    );

    return createSuccessResponse(watchlist, 201);
  } catch (error) {
    console.error("Failed to create watchlist:", error);
    return createErrorResponse("Failed to create watchlist", 500);
  }
}
