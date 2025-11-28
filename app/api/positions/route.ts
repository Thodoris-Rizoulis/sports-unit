import { NextRequest } from "next/server";
import { PositionsService } from "@/services/positions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportId = parseInt(searchParams.get("sportId") || "0");

    if (!sportId || sportId <= 0) {
      return createErrorResponse("Valid sportId is required", 400);
    }

    const positions = await PositionsService.getPositionsBySport(sportId);
    return createSuccessResponse(positions);
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return createErrorResponse("Failed to fetch positions", 500);
  }
}
