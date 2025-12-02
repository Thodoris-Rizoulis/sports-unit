import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { ConnectionService } from "@/services/connections";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const connections = await ConnectionService.getConnections(
      parseInt(session.user.id),
      status,
      limit,
      offset
    );

    // Get total count for pagination
    const total = await ConnectionService.getConnectionsCount(
      parseInt(session.user.id),
      status
    );

    return createSuccessResponse({
      connections,
      total,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
}
