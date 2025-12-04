/**
 * Migration: 019_add_notifications_table
 *
 * Creates the notifications table with enum type and indexes.
 * Supports notification types: CONNECTION_REQUEST, POST_LIKE, POST_COMMENT
 */

import { prisma } from "../lib/prisma";

async function up() {
  await prisma.$executeRaw`
    -- Create enum type if not exists
    DO $$ BEGIN
      CREATE TYPE notification_type_enum AS ENUM ('CONNECTION_REQUEST', 'POST_LIKE', 'POST_COMMENT');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `;

  await prisma.$executeRaw`
    -- Create notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type notification_type_enum NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id INTEGER NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await prisma.$executeRaw`
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread 
      ON notifications (recipient_id, is_read, created_at DESC);
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created 
      ON notifications (recipient_id, created_at DESC);
  `;

  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_notifications_actor_entity 
      ON notifications (actor_id, type, entity_id);
  `;

  await prisma.$executeRaw`
    -- Add constraint: actor cannot be recipient (no self-notifications)
    DO $$ BEGIN
      ALTER TABLE notifications 
        ADD CONSTRAINT chk_no_self_notification CHECK (actor_id != recipient_id);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `;

  console.log(
    "✅ Migration 019_add_notifications_table completed successfully"
  );
}

async function down() {
  await prisma.$executeRaw`DROP TABLE IF EXISTS notifications CASCADE;`;
  await prisma.$executeRaw`DROP TYPE IF EXISTS notification_type_enum;`;
  console.log("✅ Migration 019_add_notifications_table rolled back");
}

// Execute migration
const isRollback = process.argv.includes("--down");

(isRollback ? down() : up())
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
