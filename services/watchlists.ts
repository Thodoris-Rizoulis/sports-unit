import prisma from "@/lib/prisma";
import {
  toWatchlistSummary,
  toWatchlistAthleteItem,
  includeWatchlistWithCount,
} from "@/types/prisma";
import type {
  WatchlistSummary,
  WatchlistAthleteItem,
  CreateWatchlistInput,
  UpdateWatchlistInput,
} from "@/types/watchlists";

/**
 * Include pattern for WatchlistAthlete with full athlete data
 */
const includeWatchlistAthleteWithAthlete = {
  athlete: {
    include: {
      attributes: {
        include: {
          sport: true,
        },
      },
      athleteMetrics: true,
    },
  },
} as const;

/**
 * Service for managing user watchlists and watchlist athletes.
 * Watchlists are private to each user and support organizing discovered athletes.
 */
export class WatchlistService {
  /**
   * Get all watchlists for a user with athlete counts.
   */
  static async getUserWatchlists(userId: number): Promise<WatchlistSummary[]> {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      include: includeWatchlistWithCount,
      orderBy: { updatedAt: "desc" },
    });

    return watchlists.map(toWatchlistSummary);
  }

  /**
   * Get a single watchlist by ID with paginated athletes.
   * Returns null if watchlist doesn't exist or doesn't belong to user.
   */
  static async getWatchlistById(
    watchlistId: number,
    userId: number,
    options: { page?: number; limit?: number } = {}
  ): Promise<{
    watchlist: WatchlistSummary;
    athletes: WatchlistAthleteItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null> {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // First get the watchlist with summary info
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
      include: includeWatchlistWithCount,
    });

    if (!watchlist) {
      return null;
    }

    // Get paginated athletes
    const [athletes, total] = await Promise.all([
      prisma.watchlistAthlete.findMany({
        where: { watchlistId },
        include: includeWatchlistAthleteWithAthlete,
        orderBy: { addedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.watchlistAthlete.count({
        where: { watchlistId },
      }),
    ]);

    return {
      watchlist: toWatchlistSummary(watchlist),
      athletes: athletes.map(toWatchlistAthleteItem),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new watchlist for a user.
   */
  static async createWatchlist(
    userId: number,
    data: CreateWatchlistInput
  ): Promise<WatchlistSummary> {
    const watchlist = await prisma.watchlist.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
      include: includeWatchlistWithCount,
    });

    return toWatchlistSummary(watchlist);
  }

  /**
   * Update an existing watchlist.
   * Returns null if watchlist doesn't exist or doesn't belong to user.
   */
  static async updateWatchlist(
    watchlistId: number,
    userId: number,
    data: UpdateWatchlistInput
  ): Promise<WatchlistSummary | null> {
    // First verify the watchlist belongs to the user
    const existing = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!existing) {
      return null;
    }

    const watchlist = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      },
      include: includeWatchlistWithCount,
    });

    return toWatchlistSummary(watchlist);
  }

  /**
   * Delete a watchlist and all its athletes (cascade).
   * Returns true if deleted, false if not found or unauthorized.
   */
  static async deleteWatchlist(
    watchlistId: number,
    userId: number
  ): Promise<boolean> {
    // First verify the watchlist belongs to the user
    const existing = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!existing) {
      return false;
    }

    // Delete the watchlist (athletes cascade due to onDelete: Cascade)
    await prisma.watchlist.delete({
      where: { id: watchlistId },
    });

    return true;
  }

  /**
   * Add an athlete to a watchlist.
   * Returns the watchlist athlete item if added, null if watchlist not found or unauthorized,
   * or throws if athlete already in watchlist.
   */
  static async addAthleteToWatchlist(
    watchlistId: number,
    athleteId: number,
    userId: number
  ): Promise<WatchlistAthleteItem | null> {
    // First verify the watchlist belongs to the user
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      return null;
    }

    // Check if athlete exists
    const athlete = await prisma.user.findUnique({
      where: { id: athleteId },
    });

    if (!athlete) {
      throw new Error("Athlete not found");
    }

    // Check if already in watchlist
    const existing = await prisma.watchlistAthlete.findUnique({
      where: {
        watchlistId_athleteId: { watchlistId, athleteId },
      },
    });

    if (existing) {
      throw new Error("Athlete already in watchlist");
    }

    // Add the athlete
    const watchlistAthlete = await prisma.watchlistAthlete.create({
      data: {
        watchlistId,
        athleteId,
      },
      include: includeWatchlistAthleteWithAthlete,
    });

    // Update watchlist's updatedAt
    await prisma.watchlist.update({
      where: { id: watchlistId },
      data: { updatedAt: new Date() },
    });

    return toWatchlistAthleteItem(watchlistAthlete);
  }

  /**
   * Remove an athlete from a watchlist.
   * Returns true if removed, false if not found or unauthorized.
   */
  static async removeAthleteFromWatchlist(
    watchlistId: number,
    athleteId: number,
    userId: number
  ): Promise<boolean> {
    // First verify the watchlist belongs to the user
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
    });

    if (!watchlist) {
      return false;
    }

    // Check if athlete is in watchlist
    const existing = await prisma.watchlistAthlete.findUnique({
      where: {
        watchlistId_athleteId: { watchlistId, athleteId },
      },
    });

    if (!existing) {
      return false;
    }

    // Remove the athlete
    await prisma.watchlistAthlete.delete({
      where: {
        watchlistId_athleteId: { watchlistId, athleteId },
      },
    });

    // Update watchlist's updatedAt
    await prisma.watchlist.update({
      where: { id: watchlistId },
      data: { updatedAt: new Date() },
    });

    return true;
  }

  /**
   * Get IDs of all watchlists that contain a specific athlete.
   * Used to show which watchlists an athlete is already in.
   */
  static async getWatchlistsContainingAthlete(
    athleteId: number,
    userId: number
  ): Promise<number[]> {
    const watchlistAthletes = await prisma.watchlistAthlete.findMany({
      where: {
        athleteId,
        watchlist: { userId },
      },
      select: { watchlistId: true },
    });

    return watchlistAthletes.map((wa) => wa.watchlistId);
  }

  /**
   * Check if user owns a watchlist.
   */
  static async isWatchlistOwner(
    watchlistId: number,
    userId: number
  ): Promise<boolean> {
    const watchlist = await prisma.watchlist.findFirst({
      where: { id: watchlistId, userId },
      select: { id: true },
    });

    return watchlist !== null;
  }

  /**
   * Get athlete count for a watchlist.
   */
  static async getWatchlistAthleteCount(watchlistId: number): Promise<number> {
    return prisma.watchlistAthlete.count({
      where: { watchlistId },
    });
  }
}
