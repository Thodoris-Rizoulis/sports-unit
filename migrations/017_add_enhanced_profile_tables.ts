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
    // 1. Create athlete_metrics table (1:1 with users)
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS athlete_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        sprint_speed_30m DECIMAL(4,2) CHECK (sprint_speed_30m IS NULL OR (sprint_speed_30m >= 3.0 AND sprint_speed_30m <= 8.0)),
        agility_t_test DECIMAL(4,2) CHECK (agility_t_test IS NULL OR (agility_t_test >= 8.0 AND agility_t_test <= 20.0)),
        beep_test_level INTEGER CHECK (beep_test_level IS NULL OR (beep_test_level >= 1 AND beep_test_level <= 21)),
        beep_test_shuttle INTEGER CHECK (beep_test_shuttle IS NULL OR (beep_test_shuttle >= 1 AND beep_test_shuttle <= 16)),
        vertical_jump INTEGER CHECK (vertical_jump IS NULL OR (vertical_jump >= 10 AND vertical_jump <= 150)),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created athlete_metrics table");

    // ========================================
    // 2. Create user_experiences table (1:N with users, N:1 with teams)
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_experiences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
        year_from INTEGER NOT NULL CHECK (year_from >= 1950),
        year_to INTEGER CHECK (year_to IS NULL OR year_to >= year_from),
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created user_experiences table");

    // Create indexes for user_experiences
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_experiences_user_id
      ON user_experiences(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_experiences_year_from
      ON user_experiences(year_from DESC);
    `);
    console.log("Created user_experiences indexes");

    // ========================================
    // 3. Create user_education table (1:N with users)
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_education (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        year_from INTEGER NOT NULL CHECK (year_from >= 1950),
        year_to INTEGER CHECK (year_to IS NULL OR year_to >= year_from),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created user_education table");

    // Create indexes for user_education
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_education_user_id
      ON user_education(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_education_year_from
      ON user_education(year_from DESC);
    `);
    console.log("Created user_education indexes");

    // ========================================
    // 4. Create user_certifications table (1:N with users)
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_certifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        year INTEGER NOT NULL CHECK (year >= 1950),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created user_certifications table");

    // Create indexes for user_certifications
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id
      ON user_certifications(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_certifications_year
      ON user_certifications(year DESC);
    `);
    console.log("Created user_certifications indexes");

    // ========================================
    // 5. Create language_level_enum type and user_languages table
    // ========================================
    // Check if enum type already exists
    const enumCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'language_level_enum'
      );
    `);

    if (!enumCheck.rows[0].exists) {
      await client.query(`
        CREATE TYPE language_level_enum AS ENUM ('native', 'fluent', 'proficient', 'intermediate', 'basic');
      `);
      console.log("Created language_level_enum type");
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_languages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(100) NOT NULL,
        level language_level_enum NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created user_languages table");

    // Create index for user_languages
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_languages_user_id
      ON user_languages(user_id);
    `);
    console.log("Created user_languages index");

    // ========================================
    // 6. Create user_awards table (1:N with users)
    // ========================================
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_awards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        year INTEGER NOT NULL CHECK (year >= 1950),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Created user_awards table");

    // Create indexes for user_awards
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_awards_user_id
      ON user_awards(user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_awards_year
      ON user_awards(year DESC);
    `);
    console.log("Created user_awards indexes");

    console.log("Migration 017 completed successfully - all 6 tables created");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
