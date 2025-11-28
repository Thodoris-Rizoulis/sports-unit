import { NextRequest } from "next/server";
import { AuthService } from "@/services/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { SECURITY_CONSTANTS } from "@/lib/constants";
import { registerSchema } from "@/types/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const { email, password, username, roleId } = validatedData;

    // Check if email already exists
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      return createErrorResponse("Email already registered", 400);
    }

    // Check if username already exists
    const usernameExists = await AuthService.checkUsernameExists(username);
    if (usernameExists) {
      return createErrorResponse("Username already taken", 400);
    }

    // Check if role exists
    const roleExists = await AuthService.checkRoleExists(roleId);
    if (!roleExists) {
      return createErrorResponse("Invalid role", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      SECURITY_CONSTANTS.BCRYPT_ROUNDS
    );

    // Create user
    const user = await AuthService.registerUser(
      email,
      hashedPassword,
      username,
      roleId
    );

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        onboardingComplete: user.onboardingComplete,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid input", 400, error.issues);
    }
    return createErrorResponse("Internal server error", 500);
  }
}
