import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { ConnectionService } from "@/services/connections";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { id } = await params;
    const connectionId = parseInt(id);
    if (isNaN(connectionId)) {
      return createErrorResponse("Invalid connection ID", 400);
    }

    await ConnectionService.cancelRequest(connectionId, userId);

    return createSuccessResponse({
      message: "Connection request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling connection request:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
