import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/services/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { requireSessionUserId } from "@/lib/auth-utils";
import { DiscoveryService } from "@/services/discovery";
import { discoveryFiltersSchema } from "@/types/discovery";
import { z } from "zod";

/**
 * GET /api/discovery - Search for athletes with filters
 *
 * Query parameters are parsed and validated with Zod.
 * All filters use AND logic - results must match all specified criteria.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(req.url);

    // Parse query params into an object
    const rawFilters: Record<string, string | number | string[] | undefined> =
      {};

    // String filters
    const stringParams = ["strongFoot", "location", "sort"];
    for (const param of stringParams) {
      const value = searchParams.get(param);
      if (value) {
        rawFilters[param] = value;
      }
    }

    // Boolean filters
    const openToOpportunities = searchParams.get("openToOpportunities");
    if (openToOpportunities) {
      rawFilters["openToOpportunities"] = openToOpportunities;
    }

    // Single number filters
    const singleNumberParams = ["sportId"];
    for (const param of singleNumberParams) {
      const value = searchParams.get(param);
      if (value) {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed)) {
          rawFilters[param] = parsed;
        }
      }
    }

    // Multi-value filter: positionIds (comma-separated)
    const positionIds = searchParams.get("positionIds");
    if (positionIds) {
      rawFilters["positionIds"] = positionIds; // Will be parsed by Zod schema
    }

    // Range number filters
    const numberParams = [
      "heightMin",
      "heightMax",
      "ageMin",
      "ageMax",
      "sprintSpeed30mMin",
      "sprintSpeed30mMax",
      "agilityTTestMin",
      "agilityTTestMax",
      "beepTestLevelMin",
      "beepTestLevelMax",
      "verticalJumpMin",
      "verticalJumpMax",
      "page",
      "limit",
    ];

    for (const param of numberParams) {
      const value = searchParams.get(param);
      if (value) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          rawFilters[param] = parsed;
        }
      }
    }

    // Validate filters with Zod
    const validationResult = discoveryFiltersSchema.safeParse(rawFilters);

    if (!validationResult.success) {
      return createErrorResponse(
        "Invalid filter parameters",
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const filters = validationResult.data;

    // Search for athletes
    const sessionUserId = requireSessionUserId(session);
    const results = await DiscoveryService.searchAthletes(
      filters,
      sessionUserId
    );

    return createSuccessResponse(results);
  } catch (error) {
    console.error("Discovery search error:", error);
    return createErrorResponse("Failed to search athletes", 500);
  }
}
