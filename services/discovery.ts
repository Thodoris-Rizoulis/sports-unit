import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { DiscoveryFilters, DiscoveryResponse } from "@/types/discovery";
import {
  includeAthleteForDiscovery,
  toAthleteDiscoveryResult,
} from "@/types/prisma";

// ========================================
// Discovery Service
// ========================================

export class DiscoveryService {
  /**
   * Search athletes with filters
   * All filters use AND logic when combined
   * Current user is excluded from results
   */
  static async searchAthletes(
    filters: DiscoveryFilters,
    currentUserId: number
  ): Promise<DiscoveryResponse> {
    const { page, limit, sort, ...searchFilters } = filters;
    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where = this.buildWhereClause(searchFilters, currentUserId);

    // Build order by clause
    const orderBy = this.buildOrderByClause(sort);

    // Execute query with pagination
    const [athletes, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: includeAthleteForDiscovery,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Filter by age in application if age filters are specified
    // (Age is calculated from dateOfBirth, not stored)
    let filteredAthletes = athletes;
    if (
      searchFilters.ageMin !== undefined ||
      searchFilters.ageMax !== undefined
    ) {
      filteredAthletes = this.filterByAge(
        filteredAthletes,
        searchFilters.ageMin,
        searchFilters.ageMax
      );
    }

    // Filter by positions in application layer
    // (JSON array filtering is unreliable in Prisma across databases)
    if (searchFilters.positionIds && searchFilters.positionIds.length > 0) {
      filteredAthletes = this.filterByPositions(
        filteredAthletes,
        searchFilters.positionIds
      );
    }

    // Map to discovery result type
    const results = filteredAthletes.map((athlete) =>
      toAthleteDiscoveryResult(athlete, currentUserId)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      athletes: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Build Prisma where clause from filters
   * Uses conditional spreading for optional filters
   */
  private static buildWhereClause(
    filters: Omit<DiscoveryFilters, "page" | "limit" | "sort">,
    currentUserId: number
  ): Prisma.UserWhereInput {
    const {
      sportId,
      positionIds,
      strongFoot,
      openToOpportunities,
      location,
      heightMin,
      heightMax,
      ageMin,
      ageMax,
      sprintSpeed30mMin,
      sprintSpeed30mMax,
      agilityTTestMin,
      agilityTTestMax,
      beepTestLevelMin,
      beepTestLevelMax,
      verticalJumpMin,
      verticalJumpMax,
    } = filters;

    // Build attributes filter conditions
    const attributesConditions: Prisma.UserAttributeWhereInput = {};

    if (sportId !== undefined) {
      attributesConditions.sportId = sportId;
    }

    // Note: Position filtering with JSON arrays needs to be done in application layer
    // Prisma's array_contains for JSON doesn't work well across all databases
    // We'll filter positions after the query

    if (strongFoot !== undefined) {
      attributesConditions.strongFoot = strongFoot;
    }

    if (openToOpportunities !== undefined) {
      attributesConditions.openToOpportunities = openToOpportunities;
    }

    if (location !== undefined) {
      attributesConditions.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Height range filter
    if (heightMin !== undefined || heightMax !== undefined) {
      attributesConditions.height = {};
      if (heightMin !== undefined) {
        attributesConditions.height.gte = heightMin;
      }
      if (heightMax !== undefined) {
        attributesConditions.height.lte = heightMax;
      }
    }

    // Pre-filter by birth year for age (approximate, exact filtering done in app)
    if (ageMin !== undefined || ageMax !== undefined) {
      const today = new Date();
      const currentYear = today.getFullYear();

      attributesConditions.dateOfBirth = {};
      if (ageMin !== undefined) {
        // Max birth year for minimum age
        const maxBirthYear = currentYear - ageMin;
        attributesConditions.dateOfBirth.lte = new Date(
          `${maxBirthYear}-12-31`
        );
      }
      if (ageMax !== undefined) {
        // Min birth year for maximum age
        const minBirthYear = currentYear - ageMax - 1;
        attributesConditions.dateOfBirth.gte = new Date(
          `${minBirthYear}-01-01`
        );
      }
    }

    // Build athlete metrics filter conditions
    const metricsConditions: Prisma.AthleteMetricsWhereInput = {};
    let hasMetricsFilters = false;

    // Sprint speed (lower is better, so min/max are inverted semantically)
    if (sprintSpeed30mMin !== undefined || sprintSpeed30mMax !== undefined) {
      metricsConditions.sprintSpeed30m = {};
      hasMetricsFilters = true;
      if (sprintSpeed30mMin !== undefined) {
        metricsConditions.sprintSpeed30m.gte = sprintSpeed30mMin;
      }
      if (sprintSpeed30mMax !== undefined) {
        metricsConditions.sprintSpeed30m.lte = sprintSpeed30mMax;
      }
    }

    // Agility T-Test (lower is better)
    if (agilityTTestMin !== undefined || agilityTTestMax !== undefined) {
      metricsConditions.agilityTTest = {};
      hasMetricsFilters = true;
      if (agilityTTestMin !== undefined) {
        metricsConditions.agilityTTest.gte = agilityTTestMin;
      }
      if (agilityTTestMax !== undefined) {
        metricsConditions.agilityTTest.lte = agilityTTestMax;
      }
    }

    // Beep test level (higher is better)
    if (beepTestLevelMin !== undefined || beepTestLevelMax !== undefined) {
      metricsConditions.beepTestLevel = {};
      hasMetricsFilters = true;
      if (beepTestLevelMin !== undefined) {
        metricsConditions.beepTestLevel.gte = beepTestLevelMin;
      }
      if (beepTestLevelMax !== undefined) {
        metricsConditions.beepTestLevel.lte = beepTestLevelMax;
      }
    }

    // Vertical jump (higher is better)
    if (verticalJumpMin !== undefined || verticalJumpMax !== undefined) {
      metricsConditions.verticalJump = {};
      hasMetricsFilters = true;
      if (verticalJumpMin !== undefined) {
        metricsConditions.verticalJump.gte = verticalJumpMin;
      }
      if (verticalJumpMax !== undefined) {
        metricsConditions.verticalJump.lte = verticalJumpMax;
      }
    }

    // Construct final where clause
    const where: Prisma.UserWhereInput = {
      // Exclude current user (FR-010)
      id: { not: currentUserId },
      // Must have completed onboarding
      isOnboardingComplete: true,
    };

    // Add attributes filter if any conditions exist
    if (Object.keys(attributesConditions).length > 0) {
      where.attributes = attributesConditions;
    }

    // Add metrics filter if any conditions exist
    if (hasMetricsFilters) {
      where.athleteMetrics = metricsConditions;
    }

    return where;
  }

  /**
   * Build order by clause based on sort option
   */
  private static buildOrderByClause(
    sort: DiscoveryFilters["sort"]
  ):
    | Prisma.UserOrderByWithRelationInput
    | Prisma.UserOrderByWithRelationInput[] {
    switch (sort) {
      case "alphabetical":
        return {
          attributes: {
            firstName: "asc",
          },
        };
      case "newest":
        return {
          createdAt: "desc",
        };
      case "recent":
      default:
        return {
          updatedAt: "desc",
        };
    }
  }

  /**
   * Filter athletes by exact age calculation
   * Applied after database query for precise age filtering
   */
  private static filterByAge<
    T extends {
      attributes?: {
        dateOfBirth?: Date | null;
      } | null;
    }
  >(athletes: T[], ageMin?: number, ageMax?: number): T[] {
    if (ageMin === undefined && ageMax === undefined) {
      return athletes;
    }

    const today = new Date();

    return athletes.filter((athlete) => {
      const dob = athlete.attributes?.dateOfBirth;
      if (!dob) return false;

      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (ageMin !== undefined && age < ageMin) return false;
      if (ageMax !== undefined && age > ageMax) return false;

      return true;
    });
  }

  /**
   * Filter athletes by positions
   * Returns athletes who have ANY of the specified positions (OR logic)
   * This allows multi-select filtering: "show me all forwards OR midfielders"
   */
  private static filterByPositions<
    T extends {
      attributes?: {
        positions?: unknown;
      } | null;
    }
  >(athletes: T[], positionIds: number[]): T[] {
    if (!positionIds || positionIds.length === 0) {
      return athletes;
    }

    return athletes.filter((athlete) => {
      const positions = athlete.attributes?.positions;
      if (!positions) return false;

      // positions is stored as JSON array of numbers
      const athletePositions = Array.isArray(positions) ? positions : [];

      // Check if athlete has ANY of the requested positions (OR logic)
      return positionIds.some((posId) => athletePositions.includes(posId));
    });
  }
}
