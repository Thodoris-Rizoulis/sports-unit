import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { UserService } from "@/services/profile";
import { RolesService } from "@/services/roles";
import { AuthService } from "@/services/auth";
import { onboardingSchema } from "@/types/onboarding";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    const validatedData = onboardingSchema.parse(body);

    // Validate role exists
    const roleData = await RolesService.getRoleById(validatedData.roleId);
    if (!roleData) {
      return createErrorResponse("Invalid role selected", 400);
    }

    // Check if username is unique
    const existingId = await UserService.getUserIdByUsername(
      validatedData.username
    );
    if (existingId && existingId !== userId) {
      return createErrorResponse("Username already taken", 409);
    }

    const profileData = {
      firstName: validatedData.basicProfile.firstName,
      lastName: validatedData.basicProfile.lastName,
      bio: validatedData.basicProfile.bio,
      location: validatedData.basicProfile.location,
      dateOfBirth: validatedData.basicProfile.dateOfBirth?.toISOString(),
      height: validatedData.basicProfile.height,
      profilePictureUrl: validatedData.profilePictureUrl,
      coverPictureUrl: validatedData.coverPictureUrl,
      sportId: validatedData.sportsDetails.sportId,
      positionIds: validatedData.sportsDetails.positionIds,
      teamId: validatedData.sportsDetails.teamId,
      openToOpportunities: validatedData.sportsDetails.openToOpportunities,
      strongFoot: validatedData.sportsDetails.strongFoot,
      roleId: validatedData.roleId,
      username:
        validatedData.username !== session.user.name
          ? validatedData.username
          : undefined,
    };

    const result = await UserService.createUserProfile(userId, profileData);

    // Mark onboarding as complete
    await AuthService.updateOnboardingComplete(userId.toString());

    return createSuccessResponse(result, 201);
  } catch (error) {
    console.error("Onboarding submission failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid data", 400, error.issues);
    }

    return createErrorResponse("Failed to complete onboarding", 500);
  }
}
