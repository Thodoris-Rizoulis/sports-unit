import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { getUserIdFromUuid } from "@/services/profile";
import { LanguageService } from "@/services/languages";
import { languageSchema } from "@/types/enhanced-profile";

/**
 * GET /api/profile/[uuid]/languages
 * Get all language entries for a user
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

    const languages = await LanguageService.getAll(userId);

    return createSuccessResponse({ languages });
  } catch (error) {
    console.error("Get languages error:", error);
    return createErrorResponse("Failed to get languages", 500);
  }
}

/**
 * POST /api/profile/[uuid]/languages
 * Create a new language entry (owner only)
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
    const validationResult = languageSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid input",
        400,
        validationResult.error.issues
      );
    }

    const language = await LanguageService.create(
      userId,
      validationResult.data
    );

    return createSuccessResponse({ language }, 201);
  } catch (error) {
    // Handle duplicate language error
    if (error instanceof Error && error.message.includes("already exists")) {
      return createErrorResponse(error.message, 409);
    }
    console.error("Create language error:", error);
    return createErrorResponse("Failed to create language", 500);
  }
}
