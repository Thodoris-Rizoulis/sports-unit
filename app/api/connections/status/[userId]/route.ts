import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { ConnectionService } from "@/services/connections";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const targetUserId = parseInt(userId);
    if (isNaN(targetUserId)) {
      return createErrorResponse("Invalid user ID", 400);
    }

    const status = await ConnectionService.getConnectionStatus(
      parseInt(session.user.id),
      targetUserId
    );

    return createSuccessResponse(status);
  } catch (error) {
    console.error("Error fetching connection status:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
