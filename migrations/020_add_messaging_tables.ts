/**
 * Migration: Add Messaging Tables
 * Feature: 015-direct-messaging
 * Date: 2025-12-03
 *
 * Creates tables for direct messaging:
 * - conversations: Parent table for message threads
 * - conversation_participants: Join table linking users to conversations
 * - messages: Individual messages within conversations
 * - message_media: Media attachments for messages
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
    // ========================================
    // 1. Create conversations table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created conversations table");

    // Create index on updated_at for sorting by recent activity
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at
      ON conversations(updated_at DESC);
    `);
    console.log("Created idx_conversations_updated_at index");

    // ========================================
    // 2. Create conversation_participants table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversation_participants (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_read_at TIMESTAMP WITH TIME ZONE,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(conversation_id, user_id)
      );
    `);
    console.log("Created conversation_participants table");

    // Create indexes for efficient queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id
      ON conversation_participants(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id
      ON conversation_participants(conversation_id);
    `);
    console.log("Created conversation_participants indexes");

    // ========================================
    // 3. Create messages table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created messages table");

    // Create indexes for efficient message queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
      ON messages(conversation_id, created_at DESC);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_sender_id
      ON messages(sender_id);
    `);
    console.log("Created messages indexes");

    // ========================================
    // 4. Create message_media table
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_media (
        id SERIAL PRIMARY KEY,
        message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        media_type VARCHAR(10) NOT NULL,
        url TEXT,
        key TEXT,
        order_index INTEGER DEFAULT 0
      );
    `);
    console.log("Created message_media table");

    // Create index for message_media
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_message_media_message_id
      ON message_media(message_id);
    `);
    console.log("Created message_media index");

    console.log(
      "Migration 020 completed successfully - messaging tables created"
    );
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
