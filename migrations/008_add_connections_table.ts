import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addConnectionsTable() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    console.log(
      "Starting migration: add connections table for user networking"
    );

    // Create enum type for connection status
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_status_enum') THEN
          CREATE TYPE connection_status_enum AS ENUM ('pending', 'accepted', 'declined');
        END IF;
      END
      $$;
    `);

    // Create connections table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status connection_status_enum NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, recipient_id)
      );
    `);

    // Add indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_requester_status ON connections(requester_id, status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_recipient_status ON connections(recipient_id, status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
    `);

    console.log("Migration completed: connections table and indexes created");
  } catch (err) {
    console.error("Error during migration:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the migration
addConnectionsTable()
  .then(() => {
    console.log("Connections migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
