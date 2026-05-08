-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "area" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "TripStatus" NOT NULL DEFAULT 'PLANNING',
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTrip" (
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTrip_pkey" PRIMARY KEY ("userId","tripId")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "elevationGainM" INTEGER,
    "elevationLossM" INTEGER,
    "hutId" TEXT,
    "hutName" TEXT,
    "notes" TEXT,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_inviteCode_key" ON "Trip"("inviteCode");

-- AddForeignKey
ALTER TABLE "UserTrip" ADD CONSTRAINT "UserTrip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrip" ADD CONSTRAINT "UserTrip_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
