import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function createProfileRolesTable() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Create profile_roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profile_roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("profile_roles table created successfully");

    // Insert initial roles
    const roles = ["athlete", "coach", "scout"];
    for (const role of roles) {
      await client.query(
        `
        INSERT INTO profile_roles (role_name)
        VALUES ($1)
        ON CONFLICT (role_name) DO NOTHING
      `,
        [role]
      );
    }

    console.log("Initial roles inserted successfully");
  } catch (err) {
    console.error("Error creating profile_roles table:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the migration
createProfileRolesTable()
  .then(() => {
    console.log("Profile roles migration completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
