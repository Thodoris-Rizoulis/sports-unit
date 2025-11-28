import pool from "@/lib/db-connection";
import { Sport } from "@/types/sports";

// SportsService class
export class SportsService {
  static async getSports(): Promise<Sport[]> {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM sports ORDER BY name");
      return res.rows;
    } finally {
      client.release();
    }
  }
}
