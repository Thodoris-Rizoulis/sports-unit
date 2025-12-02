import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { ConnectionService } from "@/services/connections";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const connectionId = parseInt(id);
    if (isNaN(connectionId)) {
      return createErrorResponse("Invalid connection ID", 400);
    }

    await ConnectionService.removeConnection(
      connectionId,
      parseInt(session.user.id)
    );

    return createSuccessResponse({
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
