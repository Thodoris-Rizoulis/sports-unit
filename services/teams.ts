import pool from "@/lib/db-connection";
import { Team } from "@/types/sports";

// TeamsService class
export class TeamsService {
  static async getTeamsBySport(sportId: number): Promise<Team[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM teams WHERE sport_id = $1 ORDER BY name",
        [sportId]
      );
      return res.rows;
    } finally {
      client.release();
    }
  }
}
