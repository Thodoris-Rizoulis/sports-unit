import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addCommentLikesTable() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    console.log("Starting migration: add comment likes table");

    // Create post_comment_likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      );
    `);

    // Add index for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_comment_likes_comment_user ON post_comment_likes(comment_id, user_id);
    `);

    console.log("Migration completed: comment likes table created");
  } catch (err) {
    console.error("Error during migration:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the migration
addCommentLikesTable()
  .then(() => {
    console.log("Comment likes migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
