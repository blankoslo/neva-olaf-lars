import { notFound } from "next/navigation";
import TabBar from "../../../_components/tabbar";
import prisma from "../../../../lib/prisma";
import { TripKartClient } from "./TripKartClient";

type RouteSuggestion = { routeIds: number[] };

export default async function TripKartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id }, select: { selectedSuggestion: true } });
  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const routeIds = selected?.routeIds ?? [];

  return (
    <>
      <TripKartClient routeIds={routeIds} />
      <TabBar />
    </>
  );
}

