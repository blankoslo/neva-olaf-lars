import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { getForecast } from "@/lib/weather";
import { getRouteMidpoint } from "@/lib/ut-route";

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
  routes: {
    id?: number;
    duration: { hours: number | null; days: number | null; minutes: number | null } | null;
  }[];
};

const CATEGORIES = ["På kroppen", "I sekken", "Mat & drikke", "Navigasjon", "Annet"] as const;

/** Fallback list when AI is unavailable */
const BASE_ITEMS: { cat: string; list: string[] }[] = [
  { cat: "På kroppen", list: ["Ullundertøy", "Skalljakke", "Skallbukse", "Lue", "Hansker", "Solbriller"] },
  { cat: "I sekken", list: ["Sovepose", "Liggeunderlag", "Skift av klær", "Førstehjelp", "Hodelykt + ekstra batteri", "Regnponcho"] },
  { cat: "Mat & drikke", list: ["Primus + brensel", "Termos", "Tørrmat", "Sjokolade", "Vannflaske 1 l"] },
  { cat: "Navigasjon", list: ["Kart 1:50 000", "Kompass", "Telefon + powerbank"] },
];

function buildFallbackList(days: number): PackItem[] {
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
      items.push({ id: `ai-${counter++}`, cat: group.cat, label, aiGenerated: true, checked: false });
    }
  }
  return items;
}

async function generateAiPackingList(
  selected: RouteSuggestion | null,
  fields: Record<string, unknown>,
  participantCount: number,
): Promise<PackItem[]> {
  const days =
    typeof fields.days === "number"
      ? fields.days
      : (selected?.routes.reduce(
          (sum, r) => sum + (r.duration?.days ?? (r.duration?.hours ? 1 : 0)),
          0,
        ) ?? 1);

  // Try to get weather forecast from route coordinates
  let weatherSummary = "Ukjent vær";
  if (selected?.routes && selected.routes.length > 0) {
    const firstRoute = selected.routes[0];
    if (firstRoute.id) {
      try {
        const coord = await getRouteMidpoint(firstRoute.id);
        if (coord) {
          const forecast = await getForecast(coord.lat, coord.lon, Math.max(days, 3));
          if (forecast.length > 0) {
            const summaries = forecast.slice(0, days || 3).map(
              (d) =>
                `${d.weekday}: ${d.emoji} ${d.temp !== null ? `${d.temp}°C` : ""}${d.precipitation ? `, ${d.precipitation}mm nedbør` : ""}`,
            );
            weatherSummary = summaries.join("; ");
          }
        }
      } catch {
        // weather fetch failed — continue without it
      }
    }
  }

  const region = fields.region ? String(fields.region) : null;
  const tripTitle = selected?.title ?? null;

  const prompt = `Du er en erfaren friluftslivekspert som lager pakkelister for norske turer.

Tur-informasjon:
- Turmål: ${tripTitle ?? region ?? "Norsk natur"}
- Varighet: ${days} dag${days !== 1 ? "er" : ""}
- Antall deltakere: ${participantCount}
- Værmelding: ${weatherSummary}

Lag en detaljert og praktisk pakkeliste tilpasset denne spesifikke turen. Ta hensyn til:
1. Antall dager (mat, klær, batterier)
2. Antall deltakere (evt. delt utstyr som telt, kart, primus)
3. Værmeldingen (regnklær ved nedbør, solbeskyttelse ved sol, ekstra varme ved kulde, snøutstyr ved snø)
4. Årstid og terreng basert på turnavnet

Svar KUN med et gyldig JSON-array. Ingen forklaring, ingen markdown. Bruk disse kategoriene: ${CATEGORIES.join(", ")}.

Format:
[
  {"cat": "kategori", "label": "utstyrsnavn"},
  ...
]

Typiske gjenstander (tilpass listen basert på ovennevnte info):
- På kroppen: ullundertøy, skalljakke/-bukse, lue, hansker, solbriller, solkrem
- I sekken: sovepose (tilpass temperaturrating til vær), liggeunderlag, klær for antall dager, hodelykt, førstehjelp, regnponcho
- Mat & drikke: tørrmat for antall dager og deltakere, snacks, termos, primus + brensel (mengde etter dager), vannflaske per deltaker
- Navigasjon: kart, kompass, telefon + powerbank
- Annet: relevant ekstrautstyr`;

  const client = new Anthropic();
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";

  // Extract JSON array from response (strip any surrounding markdown fences)
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array in AI response");

  const raw = JSON.parse(match[0]) as { cat: string; label: string }[];

  return raw.map((item, i) => ({
    id: `ai-${i}`,
    cat: CATEGORIES.includes(item.cat as (typeof CATEGORIES)[number]) ? item.cat : "Annet",
    label: item.label,
    aiGenerated: true,
    checked: false,
  }));
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
          _count: { select: { participants: true } },
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

  const selected = (trip.selectedSuggestion as RouteSuggestion | null);
  const fields = (trip.planningFields as Record<string, unknown> | null) ?? {};
  const participantCount = trip._count.participants;

  const days =
    typeof fields.days === "number"
      ? fields.days
      : (selected?.routes.reduce(
          (sum, r) => sum + (r.duration?.days ?? (r.duration?.hours ? 1 : 0)),
          0,
        ) ?? 1);

  let items: PackItem[];
  try {
    items = await generateAiPackingList(selected, fields, participantCount);
  } catch (err) {
    console.error("[pack] AI generation failed, using fallback:", err);
    items = buildFallbackList(days);
  }

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
