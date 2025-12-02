/**
 * Migration: Add hashtags and post_hashtags tables
 * Feature: 010-hashtag-system
 *
 * This migration creates:
 * - hashtags table: stores unique hashtag names (lowercase)
 * - post_hashtags junction table: links posts to hashtags with timestamps
 */

import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function migrate() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log("Starting migration: 015_add_hashtags_table");

    // Create hashtags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS hashtags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✓ Created hashtags table");

    // Create junction table
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_hashtags (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, hashtag_id)
      );
    `);
    console.log("✓ Created post_hashtags junction table");

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);
    `);
    console.log("✓ Created index idx_hashtags_name");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_created 
      ON post_hashtags(hashtag_id, created_at DESC);
    `);
    console.log("✓ Created index idx_post_hashtags_hashtag_created");

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_post_hashtags_created 
      ON post_hashtags(created_at);
    `);
    console.log("✓ Created index idx_post_hashtags_created");

    console.log("Migration complete: 015_add_hashtags_table");
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}

migrate()
  .then(() => {
    console.log("Hashtags migration completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
