import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { WatchlistService } from "@/services/watchlists";
import { updateWatchlistSchema } from "@/types/watchlists";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/watchlists/[id] - Get a single watchlist with athletes
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const { id } = await params;
    const watchlistId = parseInt(id);

    if (isNaN(watchlistId)) {
      return createErrorResponse("Invalid watchlist ID", 400);
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await WatchlistService.getWatchlistById(
      watchlistId,
      userId,
      { page, limit }
    );

    if (!result) {
      return createErrorResponse("Watchlist not found", 404);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Failed to get watchlist:", error);
    return createErrorResponse("Failed to get watchlist", 500);
  }
}

/**
 * PATCH /api/watchlists/[id] - Update a watchlist
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const { id } = await params;
    const watchlistId = parseInt(id);

    if (isNaN(watchlistId)) {
      return createErrorResponse("Invalid watchlist ID", 400);
    }

    const body = await req.json();

    // Validate input
    const validationResult = updateWatchlistSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const watchlist = await WatchlistService.updateWatchlist(
      watchlistId,
      userId,
      validationResult.data
    );

    if (!watchlist) {
      return createErrorResponse("Watchlist not found", 404);
    }

    return createSuccessResponse(watchlist);
  } catch (error) {
    console.error("Failed to update watchlist:", error);
    return createErrorResponse("Failed to update watchlist", 500);
  }
}

/**
 * DELETE /api/watchlists/[id] - Delete a watchlist
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);
    const { id } = await params;
    const watchlistId = parseInt(id);

    if (isNaN(watchlistId)) {
      return createErrorResponse("Invalid watchlist ID", 400);
    }

    const deleted = await WatchlistService.deleteWatchlist(watchlistId, userId);

    if (!deleted) {
      return createErrorResponse("Watchlist not found", 404);
    }

    return createSuccessResponse({ message: "Watchlist deleted" });
  } catch (error) {
    console.error("Failed to delete watchlist:", error);
    return createErrorResponse("Failed to delete watchlist", 500);
  }
}
