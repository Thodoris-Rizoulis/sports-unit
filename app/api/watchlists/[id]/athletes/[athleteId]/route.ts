import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { WatchlistService } from "@/services/watchlists";

type RouteParams = {
  params: Promise<{ id: string; athleteId: string }>;
};

/**
 * DELETE /api/watchlists/[id]/athletes/[athleteId] - Remove an athlete from a watchlist
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { id, athleteId } = await params;
    const watchlistId = parseInt(id);
    const athleteIdNum = parseInt(athleteId);

    if (isNaN(watchlistId) || isNaN(athleteIdNum)) {
      return createErrorResponse("Invalid ID", 400);
    }

    const removed = await WatchlistService.removeAthleteFromWatchlist(
      watchlistId,
      athleteIdNum,
      userId
    );

    if (!removed) {
      return createErrorResponse("Athlete not found in watchlist", 404);
    }

    return createSuccessResponse({ message: "Athlete removed from watchlist" });
  } catch (error) {
    console.error("Failed to remove athlete from watchlist:", error);
    return createErrorResponse("Failed to remove athlete", 500);
  }
}
