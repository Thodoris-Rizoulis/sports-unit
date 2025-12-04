import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { EducationService } from "@/services/education";
import { educationSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/education
 * Get all education entries for a user
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

    const education = await EducationService.getAll(userId);

    return createSuccessResponse({ education });
  } catch (error) {
    console.error("Get education error:", error);
    return createErrorResponse("Failed to get education", 500);
  }
}

/**
 * POST /api/profile/[uuid]/education
 * Create a new education entry (owner only)
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

    const sessionUserId = requireSessionUserId(session);

    const { uuid } = await params;

    const userId = await getUserIdFromUuid(uuid);
    if (!userId) {
      return createErrorResponse("User not found", 404);
    }

    // Check ownership
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = educationSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const entry = await EducationService.create(userId, validationResult.data);

    return createSuccessResponse({ education: entry }, 201);
  } catch (error) {
    console.error("Create education error:", error);
    return createErrorResponse("Failed to create education", 500);
  }
}
