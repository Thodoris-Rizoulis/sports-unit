import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addSearchIndex() {
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
      "Starting migration: add search_text column and GIN index for full-text search on users"
    );

    // Add search_text column to store concatenated searchable text
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS search_text TEXT;
    `);

    // Create function to update search_text
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_search_text()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE users
        SET search_text = COALESCE(
          (SELECT ua.first_name FROM user_attributes ua WHERE ua.user_id = users.id), ''
        ) || ' ' || COALESCE(
          (SELECT ua.last_name FROM user_attributes ua WHERE ua.user_id = users.id), ''
        ) || ' ' || users.username
        WHERE id = COALESCE(NEW.user_id, OLD.user_id);
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers to update search_text when user_attributes change
    await client.query(`
      CREATE TRIGGER update_search_text_on_user_attributes_change
      AFTER INSERT OR UPDATE OR DELETE ON user_attributes
      FOR EACH ROW EXECUTE FUNCTION update_user_search_text();
    `);

    // Create trigger to update search_text when username changes
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_search_text_on_username_change()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_text = COALESCE(
          (SELECT ua.first_name FROM user_attributes ua WHERE ua.user_id = NEW.id), ''
        ) || ' ' || COALESCE(
          (SELECT ua.last_name FROM user_attributes ua WHERE ua.user_id = NEW.id), ''
        ) || ' ' || NEW.username;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      CREATE TRIGGER update_search_text_on_username_change
      BEFORE UPDATE ON users
      FOR EACH ROW
      WHEN (OLD.username IS DISTINCT FROM NEW.username)
      EXECUTE FUNCTION update_user_search_text_on_username_change();
    `);

    // Populate existing data
    await client.query(`
      UPDATE users
      SET search_text = COALESCE(
        (SELECT ua.first_name FROM user_attributes ua WHERE ua.user_id = users.id), ''
      ) || ' ' || COALESCE(
        (SELECT ua.last_name FROM user_attributes ua WHERE ua.user_id = users.id), ''
      ) || ' ' || users.username;
    `);

    // Create GIN index on search_text
    await client.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_search_text
      ON users
      USING GIN (to_tsvector('english', search_text));
    `);

    console.log(
      "Migration completed: GIN index for user search created successfully"
    );
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
addSearchIndex().catch((err) => {
  console.error("Migration script error:", err);
  process.exit(1);
});
