import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addPublicUuid() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    console.log("Starting migration: add public_uuid to users");

    // Create extension for gen_random_uuid if available
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Add column if not exists (nullable for now)
    await client.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS public_uuid uuid;`
    );

    // Backfill existing rows where null with gen_random_uuid()
    await client.query(
      `UPDATE users SET public_uuid = gen_random_uuid() WHERE public_uuid IS NULL;`
    );

    // Create unique index if not exists
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS users_public_uuid_idx ON users(public_uuid);`
    );

    // Set NOT NULL constraint
    await client.query(
      `ALTER TABLE users ALTER COLUMN public_uuid SET NOT NULL;`
    );

    console.log("Migration completed: public_uuid added and backfilled.");
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}

addPublicUuid()
  .then(() => {
    console.log("add-public-uuid migration finished");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
