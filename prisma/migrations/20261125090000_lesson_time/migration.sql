-- DropIndex
DROP INDEX "Session_studentId_date_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "time" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_studentId_date_time_key" ON "Session"("studentId", "date", "time");

