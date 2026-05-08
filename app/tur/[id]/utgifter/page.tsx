import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import TabBar from "../../../_components/tabbar";
import UtgifterClient from "./UtgifterClient";

export default async function TripUtgifterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!trip) notFound();

  const participants = await prisma.userTrip.findMany({
    where: { tripId: id, status: "ACCEPTED" },
    select: { user: { select: { id: true, name: true, email: true } } },
  });

  return (
    <>
      <UtgifterClient
        tripId={id}
        currentUserId={userId ?? ""}
        participants={participants.map((p) => p.user)}
      />
      <TabBar />
    </>
  );
}
