// Prisma configuration with individual database credentials
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first, then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

// Build DATABASE_URL from individual credentials
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || "5432";
const DB_USER = process.env.DB_USER;
const DB_PASS = encodeURIComponent(process.env.DB_PASS || "");
const DB_NAME = process.env.DB_NAME;

const DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Set DATABASE_URL for Prisma schema to use
process.env.DATABASE_URL = DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DATABASE_URL,
  },
});
