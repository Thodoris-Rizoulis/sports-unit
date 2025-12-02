import { NextRequest } from "next/server";
import { UserService } from "@/services/profile";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const profile = await UserService.getUserProfileByUuid(uuid);
    if (!profile) {
      return createErrorResponse("Profile not found", 404);
    }

    return createSuccessResponse(profile);
  } catch (error) {
    console.error("Failed to fetch profile by uuid:", error);
    return createErrorResponse("Failed to fetch profile", 500);
  }
}
