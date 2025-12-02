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
    // Create profile_visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_visits (
        id SERIAL PRIMARY KEY,
        visitor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        visited_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Prevent self-visits at DB level
        CONSTRAINT no_self_visits CHECK (visitor_id != visited_id)
      );
    `);

    console.log("Created profile_visits table");

    // Create index for querying visits received by a user (for analytics)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_created
      ON profile_visits(visited_id, created_at DESC);
    `);

    console.log("Created idx_profile_visits_visited_created index");

    // Create index for querying visits made by a user (for future features)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_profile_visits_visitor
      ON profile_visits(visitor_id);
    `);

    console.log("Created idx_profile_visits_visitor index");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
