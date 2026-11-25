// One-off: copies students, lessons and the password from the old SQLite file
// (dev.db) into the Postgres database in DATABASE_URL. Safe to run twice:
// rows that already exist are skipped.
//
// Usage: npm run copy-from-sqlite                 (reads ./dev.db)
//        npm run copy-from-sqlite -- path/to.db
import "dotenv/config";
import { DatabaseSync } from "node:sqlite";
import { createPrismaClient } from "../src/lib/prisma-client";

type StudentRow = { id: string; name: string; color: string; archived: number; createdAt: number | string };
type SessionRow = { id: string; date: string; time: string | null; note: string | null; createdAt: number | string; studentId: string };
type AccountRow = { id: number; passwordHash: string; updatedAt: number | string };

// Prisma's SQLite adapter stores DateTime as epoch milliseconds (or ISO text in older rows).
const toDate = (v: number | string) => new Date(typeof v === "number" ? v : /^\d+$/.test(v) ? Number(v) : v);

async function main() {
  const file = process.argv[2] ?? "dev.db";
  const sqlite = new DatabaseSync(file, { readOnly: true });
  const students = sqlite.prepare('SELECT * FROM "Student"').all() as StudentRow[];
  const sessions = sqlite.prepare('SELECT * FROM "Session"').all() as SessionRow[];
  const accounts = sqlite.prepare('SELECT * FROM "Account"').all() as AccountRow[];
  sqlite.close();

  const db = createPrismaClient();
  const s = await db.student.createMany({
    skipDuplicates: true,
    data: students.map((r) => ({ id: r.id, name: r.name, color: r.color, archived: Boolean(r.archived), createdAt: toDate(r.createdAt) })),
  });
  const l = await db.session.createMany({
    skipDuplicates: true,
    data: sessions.map((r) => ({ id: r.id, date: r.date, time: r.time, note: r.note, studentId: r.studentId, createdAt: toDate(r.createdAt) })),
  });
  let a = 0;
  for (const r of accounts) {
    const exists = await db.account.findUnique({ where: { id: r.id } });
    if (!exists) {
      await db.account.create({ data: { id: r.id, passwordHash: r.passwordHash } });
      a++;
    }
  }
  console.log(
    `Copied ${s.count}/${students.length} students, ${l.count}/${sessions.length} lesson rows, ${a}/${accounts.length} password.`,
  );
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
