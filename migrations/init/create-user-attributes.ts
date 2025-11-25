import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function createUserAttributesTable() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Create user_attributes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_attributes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        bio TEXT,
        location VARCHAR(255),
        date_of_birth DATE,
        height INTEGER, -- in cm
        profile_picture_url VARCHAR(500),
        cover_picture_url VARCHAR(500),
        sport_id INTEGER REFERENCES sports(id),
        positions JSONB, -- array of position ids
        team_id INTEGER REFERENCES teams(id),
        open_to_opportunities BOOLEAN DEFAULT FALSE,
        strong_foot VARCHAR(10), -- left, right, both
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    console.log("user_attributes table created successfully");
  } catch (err) {
    console.error("Error creating user_attributes table:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the migration
createUserAttributesTable()
  .then(() => {
    console.log("User attributes migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
