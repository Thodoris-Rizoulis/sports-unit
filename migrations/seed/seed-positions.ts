import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

const footballPositions = [
  "Goalkeeper",
  "Centre Back",
  "Left Back",
  "Right Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Left Winger",
  "Right Winger",
  "Striker",
];

async function seedPositions() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Get football sport id
    const sportResult = await client.query(
      "SELECT id FROM sports WHERE name = $1",
      ["Football"]
    );

    if (sportResult.rows.length === 0) {
      throw new Error("Football sport not found. Run seed-sports.ts first.");
    }

    const sportId = sportResult.rows[0].id;

    // Insert positions
    for (const position of footballPositions) {
      await client.query(
        `
        INSERT INTO positions (sport_id, name) VALUES ($1, $2)
        ON CONFLICT (sport_id, name) DO NOTHING
      `,
        [sportId, position]
      );
    }

    console.log("Positions seeded successfully");
  } catch (err) {
    console.error("Error seeding positions:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the seeder
seedPositions()
  .then(() => {
    console.log("Positions seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
