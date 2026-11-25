// Sets (or resets) the app password.
// Usage: npm run set-password -- "<new password>"
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { MIN_PASSWORD_LENGTH, hashPassword } from "../src/lib/password";

async function main() {
  const password = process.argv[2];
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Give a password of at least ${MIN_PASSWORD_LENGTH} characters: npm run set-password -- "<password>"`);
    process.exit(1);
  }
  const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }) });
  const passwordHash = await hashPassword(password);
  await db.account.upsert({ where: { id: 1 }, update: { passwordHash }, create: { id: 1, passwordHash } });
  console.log("Password set. All devices will need to sign in again.");
  await db.$disconnect();
}

main();
