import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addPublicUuidToPosts() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    console.log("Starting migration: add public_uuid to posts table");

    // Create extension for gen_random_uuid if not present
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Add column (nullable initially)
    await client.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS public_uuid uuid;
    `);

    // Backfill existing rows where null
    await client.query(`
      UPDATE posts SET public_uuid = gen_random_uuid() WHERE public_uuid IS NULL;
    `);

    // Create unique index and set NOT NULL
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS posts_public_uuid_idx ON posts(public_uuid);
    `);
    await client.query(`
      ALTER TABLE posts ALTER COLUMN public_uuid SET NOT NULL;
    `);

    console.log("Migration completed: public_uuid added to posts table");
  } catch (err) {
    console.error("Error during migration:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the migration
addPublicUuidToPosts()
  .then(() => {
    console.log("Posts public_uuid migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
