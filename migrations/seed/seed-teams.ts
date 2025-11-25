import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

const majorFootballTeams = [
  "Manchester United",
  "Manchester City",
  "Liverpool",
  "Chelsea",
  "Arsenal",
  "Tottenham Hotspur",
  "Newcastle United",
  "Aston Villa",
  "West Ham United",
  "Crystal Palace",
  "Brighton & Hove Albion",
  "Fulham",
  "Wolverhampton Wanderers",
  "Southampton",
  "Nottingham Forest",
  "Everton",
  "Leeds United",
  "Leicester City",
  "Barcelona",
  "Real Madrid",
  "Atletico Madrid",
  "Bayern Munich",
  "Borussia Dortmund",
  "Paris Saint-Germain",
  "Juventus",
  "AC Milan",
  "Inter Milan",
  "Napoli",
  "Roma",
];

async function seedTeams() {
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

    // Insert teams
    for (const team of majorFootballTeams) {
      await client.query(
        `
        INSERT INTO teams (sport_id, name) VALUES ($1, $2)
        ON CONFLICT (sport_id, name) DO NOTHING
      `,
        [sportId, team]
      );
    }

    console.log("Teams seeded successfully");
  } catch (err) {
    console.error("Error seeding teams:", err);
    throw err;
  } finally {
    await client.end();
  }
}

// Run the seeder
seedTeams()
  .then(() => {
    console.log("Teams seeding completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
