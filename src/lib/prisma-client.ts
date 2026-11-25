import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const isPostgresUrl = (u: string | undefined): u is string => Boolean(u && /^postgres(ql)?:\/\//.test(u));

/**
 * The Postgres connection string to use. Different Vercel database integrations
 * name it differently (Neon: DATABASE_URL, Prisma Postgres: POSTGRES_URL or
 * DATABASE_URL), so take the first plain postgres:// URL we find.
 */
export function databaseUrl() {
  return [process.env.DATABASE_URL, process.env.POSTGRES_URL, process.env.POSTGRES_PRISMA_URL].find(isPostgresUrl);
}

/** Postgres client. Used by the app (via db.ts) and by the scripts in /scripts and /prisma. */
export function createPrismaClient(connectionString = databaseUrl()) {
  if (!connectionString) throw new Error("No Postgres connection string found (set DATABASE_URL)");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
