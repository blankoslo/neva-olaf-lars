import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id: tripId } = await params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
  if (!trip) return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });

  const comments = await prisma.comment.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id: tripId } = await params;

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { id: true } });
  if (!trip) return NextResponse.json({ error: "Turen finnes ikke." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return NextResponse.json({ error: "Mangler innhold." }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "For lang melding." }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { tripId, userId, content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
