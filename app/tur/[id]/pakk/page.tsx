import { notFound } from "next/navigation";
import TabBar from "../../../_components/tabbar";
import prisma from "../../../../lib/prisma";
import PakkClient from "./PakkClient";

type RouteSuggestion = {
  title: string;
  routes: { duration: { hours: number | null; days: number | null; minutes: number | null } | null }[];
};

export default async function TripPakkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { title: true, selectedSuggestion: true, planningFields: true },
  });
  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const fields = (trip.planningFields ?? {}) as Record<string, string | number | null | undefined>;

  const days =
    typeof fields.days === "number"
      ? fields.days
      : (selected?.routes.reduce(
          (sum, r) => sum + (r.duration?.days ?? (r.duration?.hours ? 1 : 0)),
          0,
        ) ?? 0);

  return (
    <>
      <PakkClient
        tripId={id}
        tripTitle={selected?.title ?? null}
        region={fields.region ? String(fields.region) : null}
        days={days}
        hasSelectedSuggestion={!!selected}
      />
      <TabBar />
    </>
  );
}

