import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { computeSplit, type ExpenseRecord } from "@/lib/split-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id: tripId } = await params;

  const userTrip = await prisma.userTrip.findFirst({
    where: { userId, tripId },
  });
  if (!userTrip) return NextResponse.json({ error: "Fant ikke turen." }, { status: 404 });

  const [expenses, participants] = await Promise.all([
    prisma.expense.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        amount: true,
        description: true,
        splitAmong: true,
        createdAt: true,
        paidBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.userTrip.findMany({
      where: { tripId, status: "ACCEPTED" },
      select: { userId: true, user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const participantIds = participants.map((p) => p.userId);

  const expenseRecords: ExpenseRecord[] = expenses.map((e) => ({
    id: e.id,
    paidByUserId: e.paidBy.id,
    amount: e.amount,
    splitAmong: Array.isArray(e.splitAmong) ? (e.splitAmong as string[]) : null,
  }));

  const split = computeSplit(expenseRecords, participantIds);

  return NextResponse.json({
    expenses,
    participants: participants.map((p) => p.user),
    split,
  });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id: tripId } = await params;

  const userTrip = await prisma.userTrip.findFirst({
    where: { userId, tripId },
  });
  if (!userTrip) return NextResponse.json({ error: "Fant ikke turen." }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const amount =
    typeof body.amount === "number" ? body.amount : parseFloat(body.amount);
  const paidByUserId =
    typeof body.paidByUserId === "string" ? body.paidByUserId : userId;

  if (!description)
    return NextResponse.json({ error: "Mangler beskrivelse." }, { status: 400 });
  if (isNaN(amount) || amount <= 0)
    return NextResponse.json({ error: "Ugyldig beløp." }, { status: 400 });

  // Verify paidBy is a participant in this trip
  const paidByParticipant = await prisma.userTrip.findFirst({
    where: { userId: paidByUserId, tripId },
  });
  if (!paidByParticipant)
    return NextResponse.json({ error: "Ugyldig betaler." }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      tripId,
      paidByUserId,
      amount,
      description,
      splitAmong: Array.isArray(body.splitAmong) ? body.splitAmong : null,
    },
    select: {
      id: true,
      amount: true,
      description: true,
      splitAmong: true,
      createdAt: true,
      paidBy: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
