import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  const { id: sourceId } = await params;

  const sourceTrip = await prisma.trip.findUnique({
    where: { id: sourceId },
    include: {
      stages: true,
      participants: { include: { user: true } },
    },
  });

  if (!sourceTrip) {
    return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });
  }

  // Verify the user is a participant of the source trip
  const isParticipant = sourceTrip.participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }

  // Calculate new dates — shift one year forward if source has dates, else leave null
  let newStartDate: Date | null = null;
  let newEndDate: Date | null = null;
  if (sourceTrip.startDate) {
    const d = new Date(sourceTrip.startDate);
    d.setFullYear(d.getFullYear() + 1);
    newStartDate = d;
  }
  if (sourceTrip.endDate) {
    const d = new Date(sourceTrip.endDate);
    d.setFullYear(d.getFullYear() + 1);
    newEndDate = d;
  }

  // Create the new trip
  const newTrip = await prisma.trip.create({
    data: {
      title: `${sourceTrip.title} (gjentakelse)`,
      description: sourceTrip.description,
      area: sourceTrip.area,
      startDate: newStartDate,
      endDate: newEndDate,
      status: "PLANNING",
      planningFields: sourceTrip.planningFields ?? undefined,
      suggestions: sourceTrip.suggestions ?? undefined,
      selectedSuggestion: sourceTrip.selectedSuggestion ?? undefined,
      packingList: sourceTrip.packingList ?? undefined,
      sourceTripId: sourceTrip.id,
      // Copy participants (as PENDING so they need to re-confirm)
      participants: {
        create: sourceTrip.participants.map((p) => ({
          userId: p.userId,
          status: p.userId === userId ? "ACCEPTED" : "PENDING",
        })),
      },
      // Copy stages with dates shifted one year
      stages: {
        create: sourceTrip.stages.map((s) => ({
          dayNumber: s.dayNumber,
          date: s.date
            ? (() => {
                const d = new Date(s.date);
                d.setFullYear(d.getFullYear() + 1);
                return d;
              })()
            : undefined,
          fromLocation: s.fromLocation,
          toLocation: s.toLocation,
          distanceKm: s.distanceKm ?? undefined,
          durationMinutes: s.durationMinutes ?? undefined,
          elevationGainM: s.elevationGainM ?? undefined,
          elevationLossM: s.elevationLossM ?? undefined,
          hutId: s.hutId ?? undefined,
          hutName: s.hutName ?? undefined,
          notes: s.notes ?? undefined,
        })),
      },
    },
  });

  return NextResponse.json({ tripId: newTrip.id });
}
