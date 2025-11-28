import pool from "@/lib/db-connection";
import { Position } from "@/types/sports";

// PositionsService class
export class PositionsService {
  static async getPositionsBySport(sportId: number): Promise<Position[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM positions WHERE sport_id = $1 ORDER BY name",
        [sportId]
      );
      return res.rows;
    } finally {
      client.release();
    }
  }
}
