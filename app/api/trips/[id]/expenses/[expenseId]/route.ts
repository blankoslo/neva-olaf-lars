import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ id: string; expenseId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id: tripId, expenseId } = await params;

  const userTrip = await prisma.userTrip.findFirst({
    where: { userId, tripId },
  });
  if (!userTrip) return NextResponse.json({ error: "Fant ikke turen." }, { status: 404 });

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, tripId },
  });
  if (!expense) return NextResponse.json({ error: "Fant ikke utgiften." }, { status: 404 });

  await prisma.expense.delete({ where: { id: expenseId } });

  return new NextResponse(null, { status: 204 });
}
