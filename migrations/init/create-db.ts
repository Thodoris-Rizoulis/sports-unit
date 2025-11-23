import { config } from "dotenv";
import { Client } from "pg";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "postgres", // Connect to default 'postgres' database to create a new one
  });

  try {
    await client.connect();
    const dbName = process.env.DB_NAME;
    if (!dbName) {
      throw new Error("DB_NAME environment variable is not set");
    }
    // Validate dbName: only allow alphanumeric, underscores, and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
      throw new Error(
        "DB_NAME contains invalid characters. Only alphanumeric, underscores, and hyphens are allowed."
      );
    }
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database '${dbName}' created successfully`);
  } catch (err) {
    if (err && typeof err === "object") {
      // Type guard for pg errors
      type PgError = { code?: string; message?: string };
      function isPgError(e: unknown): e is PgError {
        return (
          typeof e === "object" && e !== null && ("code" in e || "message" in e)
        );
      }
      if (isPgError(err)) {
        switch (err.code) {
          case "42P04": // database already exists
            console.error(`Database '${process.env.DB_NAME}' already exists.`);
            break;
          case "42501": // insufficient privilege
            console.error(
              "Permission error: insufficient privileges to create database."
            );
            break;
          case "ECONNREFUSED":
          case "ENOTFOUND":
          case "ETIMEDOUT":
            console.error(
              "Connection error: unable to connect to the database server."
            );
            break;
          default:
            console.error("Error creating database:", err.message || err);
        }
      } else {
        console.error("Unknown error creating database:", err);
      }
    } else {
      console.error("Unknown error creating database:", err);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
