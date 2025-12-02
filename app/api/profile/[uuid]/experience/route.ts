import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { ExperienceService } from "@/services/experience";
import { experienceSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/experience
 * Get all experience entries for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    const experiences = await ExperienceService.getAll(userId);

    return createSuccessResponse({ experiences });
  } catch (error) {
    console.error("Get experience error:", error);
    return createErrorResponse("Failed to get experience", 500);
  }
}

/**
 * POST /api/profile/[uuid]/experience
 * Create a new experience entry (owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== parseInt(session.user.id)) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = experienceSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const experience = await ExperienceService.create(
      userId,
      validationResult.data
    );

    return createSuccessResponse({ experience }, 201);
  } catch (error) {
    console.error("Create experience error:", error);
    return createErrorResponse("Failed to create experience", 500);
  }
}
