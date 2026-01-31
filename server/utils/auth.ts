import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  experimental: { joins: true },
  database: new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://admin:password@localhost:5432/acd_db",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
