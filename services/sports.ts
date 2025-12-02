import prisma from "@/lib/prisma";
import type { Sport } from "@prisma/client";

// SportsService class - Prisma implementation
export class SportsService {
  static async getSports(): Promise<Sport[]> {
    return prisma.sport.findMany({
      orderBy: { name: "asc" },
    });
  }
}
