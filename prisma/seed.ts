import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

// Imported from the November 2026 WhatsApp log (no times recorded).
const data: { name: string; color: string; days: number[] }[] = [
  { name: "Gwen", color: "#ff9cc8", days: [3, 9, 10, 11, 19, 22, 23] },
  { name: "Marieline", color: "#8dcfff", days: [3, 9, 11, 19, 23] },
];

async function main() {
  for (const s of data) {
    const student =
      (await db.student.findFirst({ where: { name: s.name } })) ??
      (await db.student.create({ data: { name: s.name, color: s.color } }));
    for (const d of s.days) {
      const date = `2026-11-${String(d).padStart(2, "0")}`;
      const exists = await db.session.findFirst({ where: { studentId: student.id, date, time: null } });
      if (!exists) await db.session.create({ data: { studentId: student.id, date } });
    }
  }
  console.log("Seeded", data.map((s) => `${s.name} (${s.days.length})`).join(", "));
}

main().finally(() => db.$disconnect());
