import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export type PackItem = {
  id: string;
  cat: string;
  label: string;
  aiGenerated: boolean;
  checked: boolean;
};

type RouteSuggestion = {
  title: string;
  routes: { duration: { hours: number | null; days: number | null; minutes: number | null } | null }[];
};

const BASE_ITEMS: { cat: string; list: string[] }[] = [
  { cat: "På kroppen", list: ["Ullundertøy", "Skalljakke", "Skallbukse", "Lue", "Hansker", "Solbriller"] },
  { cat: "I sekken", list: ["Sovepose", "Liggeunderlag", "Skift av klær", "Førstehjelp", "Hodelykt + ekstra batteri", "Regnponcho"] },
  { cat: "Mat & drikke", list: ["Primus + brensel", "Termos", "Tørrmat", "Sjokolade", "Vannflaske 1 l"] },
  { cat: "Navigasjon", list: ["Kart 1:50 000", "Kompass", "Telefon + powerbank"] },
];

function generateDefaultList(
  selected: RouteSuggestion | null,
  fields: Record<string, unknown>,
): PackItem[] {
  const days =
    typeof fields.days === "number"
      ? fields.days
      : (selected?.routes.reduce(
          (sum, r) => sum + (r.duration?.days ?? (r.duration?.hours ? 1 : 0)),
          0,
        ) ?? 0);

  const expanded = BASE_ITEMS.map((group) => {
    if (group.cat === "I sekken" && days > 1) {
      return { ...group, list: [...group.list, `${days - 1} ekstra skift`, "Vaskeklut"] };
    }
    if (group.cat === "Mat & drikke" && days > 0) {
      return {
        ...group,
        list: group.list.map((i) =>
          i === "Tørrmat" ? `Tørrmat ${days} dag${days > 1 ? "er" : ""}` : i,
        ),
      };
    }
    return group;
  });

  let counter = 0;
  const items: PackItem[] = [];
  for (const group of expanded) {
    for (const label of group.list) {
      items.push({
        id: `ai-${counter++}`,
        cat: group.cat,
        label,
        aiGenerated: true,
        checked: false,
      });
    }
  }
  return items;
}

async function getAuthorizedTrip(tripId: string, userId: string) {
  return prisma.userTrip.findFirst({
    where: { userId, tripId },
    include: {
      trip: {
        select: {
          id: true,
          packingList: true,
          selectedSuggestion: true,
          planningFields: true,
        },
      },
    },
  });
}

/** GET /api/trips/[id]/pack — return current packing list, generating + persisting if needed */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id } = await params;
  const userTrip = await getAuthorizedTrip(id, userId);
  if (!userTrip) return NextResponse.json({ error: "Fant ikke turen." }, { status: 404 });

  const trip = userTrip.trip;

  if (trip.packingList) {
    return NextResponse.json({ items: trip.packingList as PackItem[] });
  }

  // Generate and persist the default list
  const items = generateDefaultList(
    (trip.selectedSuggestion as RouteSuggestion | null),
    (trip.planningFields as Record<string, unknown> | null) ?? {},
  );

  await prisma.trip.update({
    where: { id },
    data: { packingList: items },
  });

  return NextResponse.json({ items });
}

/** PATCH /api/trips/[id]/pack — persist the full updated packing list */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Ikke innlogget." }, { status: 401 });

  const { id } = await params;
  const userTrip = await getAuthorizedTrip(id, userId);
  if (!userTrip) return NextResponse.json({ error: "Fant ikke turen." }, { status: 404 });

  const body = (await req.json()) as { items: PackItem[] };
  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "Ugyldig data." }, { status: 400 });
  }

  await prisma.trip.update({
    where: { id },
    data: { packingList: body.items },
  });

  return NextResponse.json({ ok: true });
}
