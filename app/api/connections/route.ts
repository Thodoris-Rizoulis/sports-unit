import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/services/auth";
import { ConnectionService } from "@/services/connections";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { limitSchema, pageSchema, PAGINATION_DEFAULTS } from "@/types/common";

// Schema for connections query parameters
// Note: "sent" maps to "pending" with requester check, handled in service
const connectionsQuerySchema = z.object({
  status: z.enum(["pending", "accepted", "pending_received"]).optional(),
  page: pageSchema,
  limit: limitSchema,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const userId = requireSessionUserId(session);

    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const parseResult = connectionsQuerySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    if (!parseResult.success) {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        parseResult.error.issues
      );
    }

    const { status, page, limit } = parseResult.data;
    const offset = (page - 1) * limit;

    const connections = await ConnectionService.getConnections(
      userId,
      status,
      limit,
      offset
    );

    // Get total count for pagination
    const total = await ConnectionService.getConnectionsCount(userId, status);

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
