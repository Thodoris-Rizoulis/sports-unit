import pool from "@/lib/db-connection";
import { Role } from "@/types/sports";

// RolesService class
export class RolesService {
  static async getRoles(): Promise<Role[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id, role_name, description FROM profile_roles ORDER BY role_name"
      );
      return res.rows;
    } finally {
      client.release();
    }
  }

  static async getRoleById(roleId: number): Promise<Role | null> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT id, role_name, description FROM profile_roles WHERE id = $1",
        [roleId]
      );
      return res.rows.length > 0 ? res.rows[0] : null;
    } finally {
      client.release();
    }
  }
}
