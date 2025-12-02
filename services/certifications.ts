import prisma from "@/lib/prisma";
import { toCertification, CertificationUI } from "@/types/prisma";
import type { CertificationInput } from "@/types/enhanced-profile";

/**
 * CertificationService - Manages user certification entries
 * Supports CRUD operations for licenses and certifications (coach only)
 */
export class CertificationService {
  /**
   * Get all certification entries for a user, ordered by year descending
   */
  static async getAll(userId: number): Promise<CertificationUI[]> {
    const entries = await prisma.userCertification.findMany({
      where: { userId },
      orderBy: { year: "desc" },
    });
    return entries.map(toCertification);
  }

  /**
   * Get a single certification entry by ID
   */
  static async getById(id: number): Promise<CertificationUI | null> {
    const entry = await prisma.userCertification.findUnique({
      where: { id },
    });
    return entry ? toCertification(entry) : null;
  }

  /**
   * Create a new certification entry
   */
  static async create(
    userId: number,
    data: CertificationInput
  ): Promise<CertificationUI> {
    const entry = await prisma.userCertification.create({
      data: {
        userId,
        title: data.title,
        organization: data.organization ?? null,
        year: data.year,
        description: data.description ?? null,
      },
    });
    return toCertification(entry);
  }

  /**
   * Update an existing certification entry
   * Returns null if entry doesn't exist or doesn't belong to user
   */
  static async update(
    id: number,
    userId: number,
    data: Partial<CertificationInput>
  ): Promise<CertificationUI | null> {
    // Verify ownership before update
    const existing = await prisma.userCertification.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;

    const entry = await prisma.userCertification.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.organization !== undefined && { organization: data.organization }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
    return toCertification(entry);
  }

  /**
   * Delete a certification entry
   * Returns true if deleted, false if not found or not owned by user
   */
  static async delete(id: number, userId: number): Promise<boolean> {
    const existing = await prisma.userCertification.findFirst({
      where: { id, userId },
    });
    if (!existing) return false;

    await prisma.userCertification.delete({ where: { id } });
    return true;
  }
}
