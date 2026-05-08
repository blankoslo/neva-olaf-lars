-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "chatState" JSONB,
                   ADD COLUMN "planningFields" JSONB,
                   ADD COLUMN "suggestions" JSONB;
