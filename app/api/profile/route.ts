import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { UserService } from "@/services/profile";
import { profilePartialUpdateSchema } from "@/types/profile";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const profile = await UserService.getUserAttributes(userId);

    if (!profile) {
      return createErrorResponse("Profile not found", 404);
    }

    return createSuccessResponse(profile);
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return createErrorResponse("Failed to fetch profile", 500);
  }
}

// PUT /api/profile - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const validatedData = profilePartialUpdateSchema.parse(body);

    // Check if profile exists
    const existingProfile = await UserService.getUserAttributes(userId);
    if (!existingProfile) {
      return createErrorResponse("Profile not found", 404);
    }

    const updates = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      bio: validatedData.bio,
      location: validatedData.location,
      dateOfBirth: validatedData.dateOfBirth?.toISOString(),
      height: validatedData.height,
      profilePictureUrl: validatedData.profileImageUrl,
      coverPictureUrl: validatedData.coverImageUrl,
      sportId: validatedData.sportId,
      positionIds: validatedData.positionIds,
      teamId: validatedData.teamId,
      openToOpportunities: validatedData.openToOpportunities,
      strongFoot: validatedData.strongFoot,
    };

    const result = await UserService.updateUserAttributes(userId, updates);

    return createSuccessResponse(result);
  } catch (error) {
    console.error("Profile update failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid data", 400, error.issues);
    }

    return createErrorResponse("Failed to update profile", 500);
  }
}
