import { SportsService } from "@/services/sports";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const sports = await SportsService.getSports();
    return createSuccessResponse(sports);
  } catch (error) {
    console.error("Failed to fetch sports:", error);
    return createErrorResponse("Failed to fetch sports", 500);
  }
}
