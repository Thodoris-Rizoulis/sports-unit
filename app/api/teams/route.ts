import { NextRequest } from "next/server";
import { TeamsService } from "@/services/teams";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = parseInt(searchParams.get("sportId") || "0");

    if (!sportId || sportId <= 0) {
      return createErrorResponse("Valid sportId is required", 400);
    }

    const teams = await TeamsService.getTeamsBySport(sportId);
    return createSuccessResponse(teams);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return createErrorResponse("Failed to fetch teams", 500);
  }
}
