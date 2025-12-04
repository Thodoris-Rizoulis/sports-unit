import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { CertificationService } from "@/services/certifications";
import { certificationSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/certifications
 * Get all certification entries for a user
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

    const certifications = await CertificationService.getAll(userId);

    return createSuccessResponse({ certifications });
  } catch (error) {
    console.error("Get certifications error:", error);
    return createErrorResponse("Failed to get certifications", 500);
  }
}

/**
 * POST /api/profile/[uuid]/certifications
 * Create a new certification entry (owner only)
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
    const sessionUserId = requireSessionUserId(session);
    if (userId !== sessionUserId) {
      return createErrorResponse("Forbidden", 403);
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = certificationSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const certification = await CertificationService.create(
      userId,
      validationResult.data
    );

    return createSuccessResponse({ certification }, 201);
  } catch (error) {
    console.error("Create certification error:", error);
    return createErrorResponse("Failed to create certification", 500);
  }
}
