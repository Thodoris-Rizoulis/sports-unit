import prisma from "@/lib/prisma";
import { toAward, AwardUI } from "@/types/prisma";
import type { AwardInput } from "@/types/enhanced-profile";

/**
 * AwardService - Manages user award entries
 * Supports CRUD operations for awards and achievements
 */
export class AwardService {
  /**
   * Get all award entries for a user, ordered by year descending
   */
  static async getAll(userId: number): Promise<AwardUI[]> {
    const entries = await prisma.userAward.findMany({
      where: { userId },
      orderBy: { year: "desc" },
    });
    return entries.map(toAward);
  }

  /**
   * Get a single award entry by ID
   */
  static async getById(id: number): Promise<AwardUI | null> {
    const entry = await prisma.userAward.findUnique({
      where: { id },
    });
    return entry ? toAward(entry) : null;
  }

  /**
   * Create a new award entry
   */
  static async create(userId: number, data: AwardInput): Promise<AwardUI> {
    const entry = await prisma.userAward.create({
      data: {
        userId,
        title: data.title,
        year: data.year,
        description: data.description ?? null,
      },
    });
    return toAward(entry);
  }

  /**
   * Update an existing award entry
   * Returns null if entry doesn't exist or doesn't belong to user
   */
  static async update(
    id: number,
    userId: number,
    data: Partial<AwardInput>
  ): Promise<AwardUI | null> {
    // Verify ownership before update
    const existing = await prisma.userAward.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const entry = await prisma.userAward.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
    return toAward(entry);
  }

  /**
   * Delete an award entry
   * Returns true if deleted, false if not found or not owned by user
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const existing = await prisma.userAward.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.userAward.delete({ where: { id } });
    return true;
  }
}
