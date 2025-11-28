import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function addDescriptionToProfileRoles() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Add description column to profile_roles table
    await client.query(`
      ALTER TABLE profile_roles
      ADD COLUMN description TEXT;
    `);

    console.log("Added description column to profile_roles table");

    // Update existing roles with descriptions
    const roleUpdates = [
      {
        role_name: "athlete",
        description:
          "I play sports and want to connect with coaches, scouts, and other athletes.",
      },
      {
        role_name: "coach",
        description:
          "I coach sports teams and want to find talented athletes and connect with other coaches.",
      },
      {
        role_name: "scout",
        description:
          "I scout for talent and want to discover promising athletes and collaborate with coaches.",
      },
    ];

    for (const role of roleUpdates) {
      await client.query(
        `
        UPDATE profile_roles
        SET description = $1
        WHERE role_name = $2
      `,
        [role.description, role.role_name]
      );
    }

    console.log("Updated descriptions for existing roles");
  } catch (err) {
    console.error("Error adding description column:", err);
    throw err;
  } finally {
    await client.end();
  }
}

addDescriptionToProfileRoles().catch(console.error);
