import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const VALID_TAGS = [
  "familievennlig",
  "krevende",
  "naturskjønn",
  "godt merket",
  "egnet for nybegynnere",
  "lang etappe",
  "hytteovernatting",
  "telttur",
  "vinter",
  "sommer",
];

export async function GET(_req: Request, { params }: Params) {
  const { id: tripId } = await params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
  if (!trip) return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });

  const reviews = await prisma.review.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      tags: true,
      content: true,
      season: true,
      groupSize: true,
      tripDate: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id: tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { id: true, startDate: true, planningFields: true, participants: { select: { userId: true } } },
  });
  if (!trip) return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });

  // Only participants may review
  const isParticipant = trip.participants.some((p) => p.userId === userId);
  if (!isParticipant) return NextResponse.json({ error: "Bare deltakere kan anmelde turen." }, { status: 403 });

  const body = await req.json().catch(() => ({}));

  const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Poeng må være mellom 1 og 5." }, { status: 400 });

  const tags: string[] = Array.isArray(body.tags)
    ? body.tags.filter((t: unknown) => typeof t === "string" && VALID_TAGS.includes(t))
    : [];

  const content = typeof body.content === "string" ? body.content.trim().slice(0, 2000) : null;

  // Snapshot context from the trip
  const fields = (trip.planningFields ?? {}) as Record<string, unknown>;
  const season = typeof body.season === "string" ? body.season.trim().slice(0, 50) : (typeof fields.season === "string" ? fields.season : null);
  const groupSize = typeof body.groupSize === "number" ? body.groupSize : (typeof fields.groupSize === "number" ? fields.groupSize : null);
  const tripDate = trip.startDate ?? null;

  const review = await prisma.review.upsert({
    where: { tripId_userId: { tripId, userId } },
    create: { tripId, userId, rating, tags, content, season, groupSize, tripDate },
    update: { rating, tags, content, season, groupSize },
    select: {
      id: true,
      rating: true,
      tags: true,
      content: true,
      season: true,
      groupSize: true,
      tripDate: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(review, { status: 201 });
}
