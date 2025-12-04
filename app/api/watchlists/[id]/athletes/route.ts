import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { WatchlistService } from "@/services/watchlists";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ id: string }>;
};

const addAthleteSchema = z.object({
  athleteId: z.number().int().positive(),
});

/**
 * POST /api/watchlists/[id]/athletes - Add an athlete to a watchlist
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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
    const validationResult = addAthleteSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { athleteId } = validationResult.data;

    const result = await WatchlistService.addAthleteToWatchlist(
      watchlistId,
      athleteId,
      userId
    );

    if (!result) {
      return createErrorResponse("Watchlist not found", 404);
    }

    return createSuccessResponse(result, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Athlete not found") {
        return createErrorResponse("Athlete not found", 404);
      }
      if (error.message === "Athlete already in watchlist") {
        return createErrorResponse("Athlete already in watchlist", 409);
      }
    }
    console.error("Failed to add athlete to watchlist:", error);
    return createErrorResponse("Failed to add athlete to watchlist", 500);
  }
}
