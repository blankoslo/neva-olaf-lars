import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const UT_NO_API = "https://api.ut.no/";
const USER_AGENT = "Friluftskompis/1.0 hackathon";

type GradingEnum = "EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH";

interface UtRoute {
  id: number;
  name: string;
  grading: GradingEnum | null;
  descriptionPlain: string | null;
  placeA: string | null;
  placeVia: string | null;
  placeB: string | null;
  distance: number | null;
  elevationGain: number | null;
  duration: { minutes: number | null; hours: number | null; days: number | null } | null;
}

export interface RouteSuggestion {
  routeIds: number[];
  title: string;
  pitch: string;
  routes: UtRoute[];
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(UT_NO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors) console.error("[suggest] GraphQL errors:", json.errors);
  return json.data;
}

async function findAreaIds(region: string): Promise<number[]> {
  const data = await gql<{ ntb_findAreas: { edges: { node: { id: number } }[] | null } }>(`
    query FindAreas($name: [String!]!) {
      ntb_findAreas(input: {
        filters: [{ name: { values: $name, fuzzy: CONTAINS, caseInsensitive: true } }]
        pageOptions: { limit: 5 }
      }) { edges { node { id } } }
    }
  `, { name: [region] });
  return (data?.ntb_findAreas?.edges ?? []).map((e) => e.node.id);
}

async function findMunicipalityIds(region: string): Promise<number[]> {
  const data = await gql<{ ntb_findMunicipalities: { edges: { node: { id: number } }[] | null } }>(`
    query FindMunicipalities($name: [String!]!) {
      ntb_findMunicipalities(input: {
        filters: [{ name: { values: $name, fuzzy: CONTAINS, caseInsensitive: true } }]
        pageOptions: { limit: 5 }
      }) { edges { node { id } } }
    }
  `, { name: [region] });
  return (data?.ntb_findMunicipalities?.edges ?? []).map((e) => e.node.id);
}

function gradingsFromVibe(vibe: string | null): GradingEnum[] | null {
  if (!vibe) return null;
  const v = vibe.toLowerCase();
  if (v.includes("barn") || v.includes("lett") || v.includes("enkel")) return ["EASY"];
  if (
    v.includes("krevend") || v.includes("vanskelig") || v.includes("hard") ||
    v.includes("utfordren") || v.includes("tøff") || v.includes("toff")
  ) return ["TOUGH", "VERY_TOUGH"];
  // Rolig/moderat: include EASY too so we get enough day-leg candidates
  if (v.includes("moderat") || v.includes("mellom") || v.includes("rolig")) return ["EASY", "MODERATE"];
  return null;
}

async function fetchCandidateRoutes(
  areaIds: number[],
  municipalityIds: number[],
  days: number | null,
  gradings: GradingEnum[] | null,
): Promise<UtRoute[]> {
  const filters: Record<string, unknown>[] = [];

  if (areaIds.length > 0) {
    filters.push({ areaConnectionId: { values: areaIds } });
  } else if (municipalityIds.length > 0) {
    filters.push({ municipalityConnectionId: { values: municipalityIds } });
  }

  // For multi-day trips we want individual day-legs (e.g. 4-10h each) so Claude
  // can chain them. Only apply a minimum if it's a single-day trip.
  if (days == null || days <= 1) {
    filters.push({ durationHours: { values: [4], math: "GREATER_OR_EQUAL" } });
  } else {
    // At least 3h so we filter out tiny walks, but allow day-sized legs
    filters.push({ durationHours: { values: [3], math: "GREATER_OR_EQUAL" } });
  }

  if (gradings && gradings.length > 0) {
    filters.push({ grading: { values: gradings } });
  }

  filters.push({ status: { values: ["PUBLIC"] } });

  const data = await gql<{
    ntb_findRoutes: { edges: { node: UtRoute }[] | null };
  }>(`
    query FindRoutes($filters: [NTB_FindRoutesFilterInput!]!) {
      ntb_findRoutes(input: { filters: $filters, pageOptions: { limit: 40 } }) {
        edges {
          node {
            id name grading descriptionPlain placeA placeVia placeB
            distance elevationGain
            duration { minutes hours days }
          }
        }
      }
    }
  `, { filters });

  return (data?.ntb_findRoutes?.edges ?? []).map((e) => e.node);
}

const client = new Anthropic();

const SELECT_TOOL: Anthropic.Tool = {
  name: "select_suggestions",
  description: "Select 1–3 route suggestions from the candidate list that best match the trip.",
  input_schema: {
    type: "object",
    required: ["suggestions"],
    properties: {
      suggestions: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          required: ["routeIds", "title", "pitch"],
          properties: {
            routeIds: {
              type: "array",
              items: { type: "number" },
              description: "One or more route IDs (from the candidate list) that form this suggestion. Use multiple IDs to compose a multi-day trip from connected segments.",
            },
            title: {
              type: "string",
              description: "Short evocative title for the suggestion (Norwegian Bokmål, max 8 words).",
            },
            pitch: {
              type: "string",
              description: "2–3 sentences in Norwegian Bokmål explaining why this matches the trip and what makes it special. Mention accommodation if relevant.",
            },
          },
        },
      },
    },
  },
};

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ suggestions: [] }, { status: 500 });
  }

  const body = (await req.json()) as {
    region?: string;
    days?: number;
    vibe?: string;
    accommodation?: string;
    people?: number;
    when?: string;
    tripId?: string;
  };

  const { region = "", days = null, vibe = null, accommodation = null, people = null, when = null, tripId } = body;

  // 1. Resolve region → area/municipality IDs
  const [areaIds, municipalityIds] = region
    ? await Promise.all([findAreaIds(region), findMunicipalityIds(region)])
    : [[], []];

  const gradings = gradingsFromVibe(vibe);

  // 2. Fetch candidate routes
  const candidates = await fetchCandidateRoutes(areaIds, municipalityIds, days, gradings);

  if (candidates.length === 0) {
    return Response.json({ suggestions: [], candidates: [] });
  }

  // 3. Build a compact text summary of candidates for Claude
  const routeList = candidates
    .map((r) => {
      const dur = r.duration
        ? r.duration.days
          ? `${r.duration.days}d`
          : r.duration.hours
            ? `${r.duration.hours}h${r.duration.minutes ? r.duration.minutes + "min" : ""}`
            : ""
        : "";
      const dist = r.distance ? `${Math.round(r.distance / 1000)}km` : "";
      const elev = r.elevationGain ? `+${r.elevationGain}m` : "";
      const via = r.placeVia ? ` via ${r.placeVia}` : "";
      const desc = r.descriptionPlain ? ` — ${r.descriptionPlain.slice(0, 120)}` : "";
      return `[${r.id}] ${r.name} (${r.grading ?? "ukjent"}) ${dur} ${dist} ${elev} | ${r.placeA ?? "?"} → ${r.placeB ?? "?"}${via}${desc}`;
    })
    .join("\n");

  const multiDayNote = (days != null && days >= 2)
    ? `

FLEREDAGERS TUR (${days} dager):
Brukeren vil ha en sammenhengende ${days}-dagers tur. Et forslag skal bestå av ${days} ruter som lenkes:
  - Dag 1: rute A  (placeB = startpunkt neste dag)
  - Dag 2: rute B  (placeA matcher placeB fra forrige dag, helst)
  - Dag 3: rute C  (osv.)
Dvs. sluttstedet (placeB) på én rute bør være startstedet (placeA) på neste. Legg alle ${days} rute-IDer i routeIds for det forslaget. Inkluder gjerne hytte-stopp underveis hvis overnatting er hytte/DNT.
Hvis du ikke finner en perfekt kjede, velg de ${days} rutene som geografisk henger best sammen i området.`
    : "";

  const systemPrompt = `Du er Wilhelm — en norsk fjellguide siden 1962. Din oppgave er å velge de 1–3 beste turforslagene fra en liste med DNT-ruter på UT.no, basert på brukerens ønsker.

Regler:
- Velg 1–3 forslag. Hvert forslag kan bestå av én rute eller en kombinasjon av ruter.
- Prioriter ruter som passer overnatting (hytte, telt, etc.) og turens karakter.${multiDayNote}
- Begrunn hvert valg med 2–3 setninger på norsk bokmål — ekte, konkret, ikke generisk.
- Bruk ALLTID select_suggestions-verktøyet.`;

  const userPrompt = `Brukerens ønsker:
- Område: ${region || "ikke oppgitt"}
- Antall dager: ${days ?? "ikke oppgitt"}${days != null && days >= 2 ? ` (kombiner ${days} ruter som henger geografisk sammen)` : ""}
- Karakter/vibe: ${vibe ?? "ikke oppgitt"}
- Overnatting: ${accommodation ?? "ikke oppgitt"}
- Antall personer: ${people ?? "ikke oppgitt"}
- Tidspunkt: ${when ?? "ikke oppgitt"}

Kandidatruter fra UT.no:
${routeList}

Velg de beste forslagene. For ${days ?? 1}-dagers tur: hvert forslag skal ha ${days ?? 1} rute-ID(er) som til sammen dekker hele turen.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    tools: [SELECT_TOOL],
    tool_choice: { type: "tool", name: "select_suggestions" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return Response.json({ suggestions: [], candidates });
  }

  const { suggestions } = toolUse.input as { suggestions: { routeIds: number[]; title: string; pitch: string }[] };

  // 4. Attach full route objects to each suggestion
  const routeMap = new Map(candidates.map((r) => [r.id, r]));
  const enriched: RouteSuggestion[] = suggestions.map((s) => ({
    ...s,
    routes: s.routeIds.map((id) => routeMap.get(id)).filter(Boolean) as UtRoute[],
  }));

  // 5. Persist suggestions to the trip if tripId provided
  if (tripId) {
    await prisma.trip.update({
      where: { id: tripId },
      data: { suggestions: enriched as unknown as object },
    }).catch((e) => console.error("[suggest] Failed to save suggestions:", e));
  }

  return Response.json({ suggestions: enriched, candidates });
}
