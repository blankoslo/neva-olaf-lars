import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { inviteCode } = body as { inviteCode?: string };

  if (!inviteCode) {
    return NextResponse.json({ error: "Mangler inviteCode." }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({ where: { inviteCode } });
  if (!trip) {
    return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });
  }

  await prisma.userTrip.upsert({
    where: { userId_tripId: { userId, tripId: trip.id } },
    create: { userId, tripId: trip.id, status: "ACCEPTED" },
    update: { status: "ACCEPTED" },
  });

  return NextResponse.json({ tripId: trip.id });
}
