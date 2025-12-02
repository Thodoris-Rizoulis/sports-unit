import prisma from "@/lib/prisma";
import { toExperience, ExperienceUI } from "@/types/prisma";
import type { ExperienceInput } from "@/types/enhanced-profile";

/**
 * ExperienceService - Manages user experience entries
 * Supports CRUD operations for work/team experience
 */
export class ExperienceService {
  /**
   * Get all experience entries for a user, ordered by yearFrom descending
   */
  static async getAll(userId: number): Promise<ExperienceUI[]> {
    const experiences = await prisma.userExperience.findMany({
      where: { userId },
      include: { team: { select: { name: true } } },
      orderBy: { yearFrom: "desc" },
    });
    return experiences.map(toExperience);
  }

  /**
   * Get a single experience entry by ID
   */
  static async getById(id: number): Promise<ExperienceUI | null> {
    const experience = await prisma.userExperience.findUnique({
      where: { id },
      include: { team: { select: { name: true } } },
    });
    return experience ? toExperience(experience) : null;
  }

  /**
   * Create a new experience entry
   */
  static async create(
    userId: number,
    data: ExperienceInput
  ): Promise<ExperienceUI> {
    const experience = await prisma.userExperience.create({
      data: {
        userId,
        title: data.title,
        teamId: data.teamId,
        yearFrom: data.yearFrom,
        yearTo: data.yearTo ?? null,
        location: data.location ?? null,
      },
      include: { team: { select: { name: true } } },
    });
    return toExperience(experience);
  }

  /**
   * Update an existing experience entry
   * Returns null if entry doesn't exist or doesn't belong to user
   */
  static async update(
    id: number,
    userId: number,
    data: Partial<ExperienceInput>
  ): Promise<ExperienceUI | null> {
    // Verify ownership before update
    const existing = await prisma.userExperience.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const experience = await prisma.userExperience.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.teamId !== undefined && { teamId: data.teamId }),
        ...(data.yearFrom !== undefined && { yearFrom: data.yearFrom }),
        ...(data.yearTo !== undefined && { yearTo: data.yearTo }),
        ...(data.location !== undefined && { location: data.location }),
      },
      include: { team: { select: { name: true } } },
    });
    return toExperience(experience);
  }

  /**
   * Delete an experience entry
   * Returns true if deleted, false if not found or not owned by user
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const existing = await prisma.userExperience.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.userExperience.delete({ where: { id } });
    return true;
  }
}
