import "dotenv/config";
import { defineConfig } from "prisma/config";

const isPostgresUrl = (u: string | undefined): u is string => Boolean(u && /^postgres(ql)?:\/\//.test(u));

// Migrations prefer a direct (non-pooled) connection. Neon on Vercel provides
// DATABASE_URL_UNPOOLED, Prisma Postgres provides POSTGRES_URL / DATABASE_URL.
const url = [
  process.env.DATABASE_URL_UNPOOLED,
  process.env.POSTGRES_URL_NON_POOLING,
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
].find(isPostgresUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: url ?? "",
  },
});
