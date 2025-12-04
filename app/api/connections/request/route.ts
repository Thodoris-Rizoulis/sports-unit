import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { ConnectionService } from "@/services/connections";
import { connectionRequestSchema } from "@/types/connections";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

// POST /api/connections/request - Send a connection request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const requesterId = requireSessionUserId(session);
    const body = await request.json();

    // Validate request body
    const validatedData = connectionRequestSchema.parse(body);

    // Send connection request
    const connection = await ConnectionService.sendRequest(
      requesterId,
      validatedData.recipientId
    );

    return createSuccessResponse({
      id: connection.id,
      status: connection.status,
    });
  } catch (error) {
    console.error("Connection request failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid request data", 400);
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Cannot send connection request to yourself")
      ) {
        return createErrorResponse("Cannot connect to yourself", 400);
      }
      if (error.message.includes("already connected")) {
        return createErrorResponse("Users are already connected", 400);
      }
      if (error.message.includes("already exists")) {
        return createErrorResponse("Connection request already exists", 400);
      }
    }

    return createErrorResponse("Failed to send connection request", 500);
  }
}
