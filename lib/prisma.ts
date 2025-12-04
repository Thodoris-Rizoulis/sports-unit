import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Build DATABASE_URL from individual credentials
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || "5432";
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS || "";
const DB_NAME = process.env.DB_NAME;

// Connection pool configuration
// Optimized for serverless/edge environments
const poolConfig = {
  host: DB_HOST,
  port: parseInt(DB_PORT),
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  // Pool size optimization
  max: process.env.NODE_ENV === "production" ? 10 : 5, // Max connections
  min: process.env.NODE_ENV === "production" ? 2 : 1, // Min idle connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout for new connections
  // Statement timeout to prevent long-running queries
  statement_timeout: 30000, // 30 seconds
};

// Create connection pool
const pool = new Pool(poolConfig);

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
