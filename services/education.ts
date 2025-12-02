import prisma from "@/lib/prisma";
import { toEducation, EducationUI } from "@/types/prisma";
import type { EducationInput } from "@/types/enhanced-profile";

/**
 * EducationService - Manages user education entries
 * Supports CRUD operations for education history
 */
export class EducationService {
  /**
   * Get all education entries for a user, ordered by yearFrom descending
   */
  static async getAll(userId: number): Promise<EducationUI[]> {
    const entries = await prisma.userEducation.findMany({
      where: { userId },
      orderBy: { yearFrom: "desc" },
    });
    return entries.map(toEducation);
  }

  /**
   * Get a single education entry by ID
   */
  static async getById(id: number): Promise<EducationUI | null> {
    const entry = await prisma.userEducation.findUnique({
      where: { id },
    });
    return entry ? toEducation(entry) : null;
  }

  /**
   * Create a new education entry
   */
  static async create(
    userId: number,
    data: EducationInput
  ): Promise<EducationUI> {
    const entry = await prisma.userEducation.create({
      data: {
        userId,
        title: data.title,
        subtitle: data.subtitle ?? null,
        yearFrom: data.yearFrom,
        yearTo: data.yearTo ?? null,
      },
    });
    return toEducation(entry);
  }

  /**
   * Update an existing education entry
   * Returns null if entry doesn't exist or doesn't belong to user
   */
  static async update(
    id: number,
    userId: number,
    data: Partial<EducationInput>
  ): Promise<EducationUI | null> {
    // Verify ownership before update
    const existing = await prisma.userEducation.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const entry = await prisma.userEducation.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.yearFrom !== undefined && { yearFrom: data.yearFrom }),
        ...(data.yearTo !== undefined && { yearTo: data.yearTo }),
      },
    });
    return toEducation(entry);
  }

  /**
   * Delete an education entry
   * Returns true if deleted, false if not found or not owned by user
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const existing = await prisma.userEducation.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.userEducation.delete({ where: { id } });
    return true;
  }
}
