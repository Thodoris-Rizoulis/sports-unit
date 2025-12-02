import prisma from "@/lib/prisma";
import { toLanguage, LanguageUI } from "@/types/prisma";
import type { LanguageInput } from "@/types/enhanced-profile";

/**
 * LanguageService - Manages user language entries
 * Supports CRUD operations for languages spoken
 */
export class LanguageService {
  /**
   * Get all language entries for a user, ordered by level priority
   */
  static async getAll(userId: number): Promise<LanguageUI[]> {
    const entries = await prisma.userLanguage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" }, // Show in order added
    });
    return entries.map(toLanguage);
  }

  /**
   * Get a single language entry by ID
   */
  static async getById(id: number): Promise<LanguageUI | null> {
    const entry = await prisma.userLanguage.findUnique({
      where: { id },
    });
    return entry ? toLanguage(entry) : null;
  }

  /**
   * Create a new language entry
   * Checks for duplicate language names (case-insensitive)
   */
  static async create(
    userId: number,
    data: LanguageInput
  ): Promise<LanguageUI> {
    // Check for duplicate language (case-insensitive)
    const existing = await prisma.userLanguage.findFirst({
      where: {
        userId,
        language: {
          equals: data.language,
          mode: "insensitive",
        },
      },
    });
    if (existing) {
      throw new Error("Language already exists for this user");
    }

    const entry = await prisma.userLanguage.create({
      data: {
        userId,
        language: data.language,
        level: data.level,
      },
    });
    return toLanguage(entry);
  }

  /**
   * Update an existing language entry
   * Returns null if entry doesn't exist or doesn't belong to user
   */
  static async update(
    id: number,
    userId: number,
    data: Partial<LanguageInput>
  ): Promise<LanguageUI | null> {
    // Verify ownership before update
    const existing = await prisma.userLanguage.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    // If updating language name, check for duplicates
    if (data.language && data.language !== existing.language) {
      const duplicate = await prisma.userLanguage.findFirst({
        where: {
          userId,
          language: {
            equals: data.language,
            mode: "insensitive",
          },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new Error("Language already exists for this user");
      }
    }

    const entry = await prisma.userLanguage.update({
      where: { id },
      data: {
        ...(data.language !== undefined && { language: data.language }),
        ...(data.level !== undefined && { level: data.level }),
      },
    });
    return toLanguage(entry);
  }

  /**
   * Delete a language entry
   * Returns true if deleted, false if not found or not owned by user
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const existing = await prisma.userLanguage.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.userLanguage.delete({ where: { id } });
    return true;
  }
}
