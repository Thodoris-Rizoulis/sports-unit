import { Pool } from "pg";
import { Sport, Position, Team, UserAttribute } from "@/types/database";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Database schema type definitions

// Helper functions for common queries

export async function getSports(): Promise<Sport[]> {
  const result = await query("SELECT * FROM sports ORDER BY name");
  return result.rows;
}

export async function getPositionsBySport(
  sportId: number
): Promise<Position[]> {
  const result = await query(
    "SELECT * FROM positions WHERE sport_id = $1 ORDER BY name",
    [sportId]
  );
  return result.rows;
}

export async function getTeamsBySport(sportId: number): Promise<Team[]> {
  const result = await query(
    "SELECT * FROM teams WHERE sport_id = $1 ORDER BY name",
    [sportId]
  );
  return result.rows;
}

export async function getUserAttributes(
  userId: number
): Promise<UserAttribute | null> {
  const result = await query(
    "SELECT * FROM user_attributes WHERE user_id = $1",
    [userId]
  );
  return result.rows[0] || null;
}

export default pool;
