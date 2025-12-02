import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { ConnectionService } from "@/services/connections";
import { connectionResponseSchema } from "@/types/connections";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

// POST /api/connections/[id]/respond - Respond to a connection request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = parseInt(session.user.id);
    const connectionId = parseInt(id);

    if (isNaN(connectionId)) {
      return createErrorResponse("Invalid connection ID", 400);
    }

    const body = await request.json();

    // Validate request body
    const validatedData = connectionResponseSchema.parse(body);

    // Verify user is the recipient of this connection request
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      select: { recipientId: true, status: true },
    });

    if (!connection) {
      return createErrorResponse("Connection request not found", 404);
    }

    if (connection.recipientId !== userId) {
      return createErrorResponse(
        "Not authorized to respond to this request",
        403
      );
    }

    if (connection.status !== "pending") {
      return createErrorResponse("Request has already been responded to", 400);
    }

    // Respond to the connection request
    const updatedConnection = await ConnectionService.respondToRequest(
      connectionId,
      validatedData.action
    );

    return createSuccessResponse({
      id: updatedConnection.id,
      status: updatedConnection.status,
    });
  } catch (error) {
    console.error("Connection response failed:", error);

    if (error instanceof z.ZodError) {
      return createErrorResponse("Invalid request data", 400);
    }

    if (error instanceof Error) {
      if (error.message.includes("not found or already responded")) {
        return createErrorResponse(
          "Connection request not found or already responded to",
          404
        );
      }
    }

    return createErrorResponse("Failed to respond to connection request", 500);
  }
}
