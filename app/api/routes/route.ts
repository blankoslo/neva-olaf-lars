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
  placeB: string | null;
  duration: { minutes: number | null; hours: number | null; days: number | null } | null;
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(UT_NO_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data: T; errors?: unknown[] };
  if (json.errors) {
    console.error("[routes] GraphQL errors:", json.errors);
  }
  return json.data;
}

/** Find area IDs matching a region name. */
async function findAreaIds(region: string): Promise<number[]> {
  const data = await gql<{
    ntb_findAreas: { edges: { node: { id: number; name: string } }[] | null };
  }>(`
    query FindAreas($name: [String!]!) {
      ntb_findAreas(input: {
        filters: [{ name: { values: $name, fuzzy: CONTAINS, caseInsensitive: true } }]
        pageOptions: { limit: 5 }
      }) {
        edges { node { id name } }
      }
    }
  `, { name: [region] });

  return (data?.ntb_findAreas?.edges ?? []).map((e) => e.node.id);
}

/** Find municipality IDs matching a region name (used as fallback if no areas found). */
async function findMunicipalityIds(region: string): Promise<number[]> {
  const data = await gql<{
    ntb_findMunicipalities: { edges: { node: { id: number; name: string } }[] | null };
  }>(`
    query FindMunicipalities($name: [String!]!) {
      ntb_findMunicipalities(input: {
        filters: [{ name: { values: $name, fuzzy: CONTAINS, caseInsensitive: true } }]
        pageOptions: { limit: 5 }
      }) {
        edges { node { id name } }
      }
    }
  `, { name: [region] });

  return (data?.ntb_findMunicipalities?.edges ?? []).map((e) => e.node.id);
}

/** Build grading filter values from the vibe field. */
function gradingsFromVibe(vibe: string | null): GradingEnum[] | null {
  if (!vibe) return null;
  const v = vibe.toLowerCase();
  if (v.includes("barn") || v.includes("lett") || v.includes("enkel")) {
    return ["EASY"];
  }
  if (
    v.includes("krevend") ||
    v.includes("vanskelig") ||
    v.includes("hard") ||
    v.includes("utfordren") ||
    v.includes("tøff") ||
    v.includes("toff")
  ) {
    return ["TOUGH", "VERY_TOUGH"];
  }
  if (v.includes("moderat") || v.includes("mellom") || v.includes("rolig")) {
    return ["MODERATE"];
  }
  return null;
}

/** Search UT.no for routes matching the given trip criteria. */
async function findRoutes(
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

  // For multi-day trips, require a minimum route duration in hours
  if (days != null && days >= 2) {
    const minHours = Math.max(4, days * 2);
    filters.push({ durationHours: { values: [minHours], math: "GREATER_OR_EQUAL" } });
  }

  if (gradings && gradings.length > 0) {
    filters.push({ grading: { values: gradings } });
  }

  // Always filter by published status
  filters.push({ status: { values: ["PUBLIC"] } });

  const data = await gql<{
    ntb_findRoutes: {
      totalCount: number;
      edges: { node: UtRoute }[] | null;
    };
  }>(`
    query FindRoutes($filters: [NTB_FindRoutesFilterInput!]!) {
      ntb_findRoutes(input: {
        filters: $filters
        pageOptions: { limit: 12 }
      }) {
        totalCount
        edges {
          node {
            id
            name
            grading
            descriptionPlain
            placeA
            placeB
            duration { minutes hours days }
          }
        }
      }
    }
  `, { filters });

  return (data?.ntb_findRoutes?.edges ?? []).map((e) => e.node);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const region = url.searchParams.get("region") ?? "";
  const days = url.searchParams.get("days") ? Number(url.searchParams.get("days")) : null;
  const vibe = url.searchParams.get("vibe");

  try {
    // Run area and municipality lookups in parallel
    const [areaIds, municipalityIds] = region
      ? await Promise.all([findAreaIds(region), findMunicipalityIds(region)])
      : [[], []];

    // Build grading filter from vibe
    const gradings = gradingsFromVibe(vibe);

    // Fetch routes (area filter takes priority; falls back to municipality)
    const routes = await findRoutes(areaIds, municipalityIds, days, gradings);

    return Response.json({ routes, areaCount: areaIds.length + municipalityIds.length });
  } catch (err) {
    console.error("[routes] error:", err);
    return Response.json({ routes: [], areaCount: 0 }, { status: 500 });
  }
}
