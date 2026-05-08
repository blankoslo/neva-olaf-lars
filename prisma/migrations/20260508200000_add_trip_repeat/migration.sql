-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "sourceTripId" TEXT;
ALTER TABLE "Trip" ADD COLUMN "completedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_sourceTripId_fkey" FOREIGN KEY ("sourceTripId") REFERENCES "Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;
