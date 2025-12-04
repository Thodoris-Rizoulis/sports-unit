import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function main() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  await client.connect();

  try {
    // ========================================
    // 1. Create watchlists table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created watchlists table");

    // Create index for watchlists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_watchlists_user_id
      ON watchlists(user_id);
    `);
    console.log("Created idx_watchlists_user_id index");

    // ========================================
    // 2. Create watchlist_athletes junction table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS watchlist_athletes (
        id SERIAL PRIMARY KEY,
        watchlist_id INTEGER NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
        athlete_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(watchlist_id, athlete_id)
      );
    `);
    console.log("Created watchlist_athletes table");

    // Create indexes for watchlist_athletes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_watchlist_athletes_watchlist_id
      ON watchlist_athletes(watchlist_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_watchlist_athletes_athlete_id
      ON watchlist_athletes(athlete_id);
    `);
    console.log("Created watchlist_athletes indexes");

    console.log(
      "Migration 018 completed successfully - watchlists tables created"
    );
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
