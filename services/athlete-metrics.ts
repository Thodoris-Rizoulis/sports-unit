import prisma from "@/lib/prisma";
import { toAthleteMetrics, AthleteMetricsUI } from "@/types/prisma";
import type { AthleteMetricsInput } from "@/types/enhanced-profile";

/**
 * AthleteMetricsService - Manages athlete performance metrics
 * Supports get and upsert operations for athlete-only data
 */
export class AthleteMetricsService {
  /**
   * Get athlete metrics by user ID
   */
  static async get(userId: number): Promise<AthleteMetricsUI | null> {
    const metrics = await prisma.athleteMetrics.findUnique({
      where: { userId },
    });
    return toAthleteMetrics(metrics);
  }

  /**
   * Create or update athlete metrics
   * Uses upsert to handle both create and update in one call
   */
  static async upsert(
    userId: number,
    data: AthleteMetricsInput
  ): Promise<AthleteMetricsUI> {
    const metrics = await prisma.athleteMetrics.upsert({
      where: { userId },
      create: {
        userId,
        sprintSpeed30m: data.sprintSpeed30m ?? null,
        agilityTTest: data.agilityTTest ?? null,
        beepTestLevel: data.beepTestLevel ?? null,
        beepTestShuttle: data.beepTestShuttle ?? null,
        verticalJump: data.verticalJump ?? null,
      },
      update: {
        sprintSpeed30m: data.sprintSpeed30m ?? null,
        agilityTTest: data.agilityTTest ?? null,
        beepTestLevel: data.beepTestLevel ?? null,
        beepTestShuttle: data.beepTestShuttle ?? null,
        verticalJump: data.verticalJump ?? null,
      },
    });

    return toAthleteMetrics(metrics)!;
  }

  /**
   * Delete athlete metrics for a user
   */
  static async delete(userId: number): Promise<void> {
    await prisma.athleteMetrics.delete({
      where: { userId },
    });
  }
}
