import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function removeLinkMetadataFromPostMedia() {
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
      "Starting migration: remove title and description from post_media table"
    );

    // Remove title and description columns
    await client.query(`
      ALTER TABLE post_media
      DROP COLUMN IF EXISTS title,
      DROP COLUMN IF EXISTS description;
    `);

    console.log(
      "Migration completed: title and description removed from post_media table"
    );
  } catch (err) {
    console.error("Error during migration:", err);
    throw err;
  } finally {
    await client.end();
  }
}

removeLinkMetadataFromPostMedia().catch(console.error);
