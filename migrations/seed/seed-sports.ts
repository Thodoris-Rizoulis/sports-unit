import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function seedSports() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Insert football sport
    await client.query(`
      INSERT INTO sports (name) VALUES ('Football')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log("Sports seeded successfully");
  } catch (err) {
    console.error("Error seeding sports:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the seeder
seedSports()
  .then(() => {
    console.log("Sports seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
