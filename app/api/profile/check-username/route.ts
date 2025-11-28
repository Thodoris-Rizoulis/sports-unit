import { NextRequest } from "next/server";
import { UserService } from "@/services/profile";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return createErrorResponse("Username is required", 400);
    }

    // Check if username exists
    const existingId = await UserService.getUserIdByUsername(username);

    return createSuccessResponse({
      available: !existingId,
    });
  } catch (error) {
    console.error("Failed to check username availability:", error);
    return createErrorResponse("Failed to check username availability", 500);
  }
}
