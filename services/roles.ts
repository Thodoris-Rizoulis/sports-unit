import prisma from "@/lib/prisma";
import type { ProfileRole } from "@prisma/client";

// RolesService class - Prisma implementation
export class RolesService {
  static async getRoles(): Promise<ProfileRole[]> {
    return prisma.profileRole.findMany({
      orderBy: { roleName: "asc" },
    });
  }

  static async getRoleById(roleId: number): Promise<ProfileRole | null> {
    return prisma.profileRole.findUnique({
      where: { id: roleId },
    });
  }
}
