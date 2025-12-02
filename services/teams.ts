import prisma from "@/lib/prisma";
import type { Team } from "@prisma/client";

// TeamsService class - Prisma implementation
export class TeamsService {
  static async getTeamsBySport(sportId: number): Promise<Team[]> {
    return prisma.team.findMany({
      where: { sportId },
      orderBy: { name: "asc" },
    });
  }

  static async getTeamById(teamId: number): Promise<Team | null> {
    return prisma.team.findUnique({
      where: { id: teamId },
    });
  }
}
