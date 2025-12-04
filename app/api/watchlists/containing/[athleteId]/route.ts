import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { WatchlistService } from "@/services/watchlists";

type RouteParams = {
  params: Promise<{ athleteId: string }>;
};

/**
 * GET /api/watchlists/containing/[athleteId] - Get watchlist IDs containing an athlete
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { athleteId } = await params;
    const athleteIdNum = parseInt(athleteId);

    if (isNaN(athleteIdNum)) {
      return createErrorResponse("Invalid athlete ID", 400);
    }

    const watchlistIds = await WatchlistService.getWatchlistsContainingAthlete(
      athleteIdNum,
      parseInt(session.user.id)
    );

    return createSuccessResponse({ watchlistIds });
  } catch (error) {
    console.error("Failed to get watchlists containing athlete:", error);
    return createErrorResponse("Failed to get watchlists", 500);
  }
}
