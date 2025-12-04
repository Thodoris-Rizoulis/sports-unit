/**
 * Migration: Add COMMENT_REPLY to notification_type_enum
 * Feature: Post/Comment management enhancements
 * Date: 2025-12-04
 *
 * This migration adds the COMMENT_REPLY value to the notification_type_enum
 * to support notifications when users reply to comments.
 */

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
    console.log(
      "Starting migration: Add COMMENT_REPLY to notification_type_enum..."
    );

    // Add COMMENT_REPLY to the enum
    await client.query(`
      ALTER TYPE notification_type_enum ADD VALUE IF NOT EXISTS 'COMMENT_REPLY';
    `);

    console.log("✓ Added COMMENT_REPLY to notification_type_enum");
    console.log("Migration 021 completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
