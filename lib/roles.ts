import { query } from "@/lib/db";

export interface Role {
  id: number;
  role_name: string;
}

export async function getRoles(): Promise<Role[]> {
  try {
    const result = await query(
      "SELECT id, role_name FROM profile_roles ORDER BY role_name"
    );
    return result.rows;
  } catch (error) {
    console.error("Roles fetch error:", error);
    throw new Error("Failed to fetch roles");
  }
}
