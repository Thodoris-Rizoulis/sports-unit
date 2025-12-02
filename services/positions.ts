import prisma from "@/lib/prisma";
import type { Position } from "@prisma/client";

// PositionsService class - Prisma implementation
export class PositionsService {
  static async getPositionsBySport(sportId: number): Promise<Position[]> {
    return prisma.position.findMany({
      where: { sportId },
      orderBy: { name: "asc" },
    });
  }
}
