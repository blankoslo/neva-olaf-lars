import { NextResponse } from "next/server";
import { FALLBACK_HUTS } from "@/lib/huts-fallback";

const UT_API =
  "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql";

const SERVICE_LABEL: Record<string, string> = {
  STAFFED: "Betjent",
  SELF_SERVICE: "Selvbetjent",
  NO_SERVICE: "Ubetjent",
  RENTAL: "Utleiehytte",
};

function buildQuery(after?: string) {
  const paging = after
    ? `paging: { first: 1000, after: "${after}" }`
    : `paging: { first: 1000 }`;
  return `{
    cabins(${paging}) {
      pageInfo { endCursor hasNextPage }
      edges {
        node {
          id name serviceLevel dntCabin geojson
          bedsStaffed bedsSelfService bedsNoService bedsExtra
        }
      }
    }
  }`;
}

async function fetchPage(after?: string) {
  const res = await fetch(UT_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: buildQuery(after) }),
    cache: "no-store",
  });
  const json = await res.json();
  const cabins = json?.data?.cabins;
  return {
    edges: (cabins?.edges ?? []) as Array<{ node: Record<string, unknown> }>,
    hasNextPage: cabins?.pageInfo?.hasNextPage ?? false,
    endCursor: cabins?.pageInfo?.endCursor as string | undefined,
  };
}

function normalizeEdges(edges: Array<{ node: Record<string, unknown> }>) {
  return edges
    .map(({ node: c }) => {
      const coords = (c.geojson as { coordinates?: number[] } | null)
        ?.coordinates;
      if (!coords || coords.length < 2) return null;
      const [lon, lat] = coords;
      const beds =
        ((c.bedsStaffed as number) || 0) +
        ((c.bedsSelfService as number) || 0) +
        ((c.bedsNoService as number) || 0) +
        ((c.bedsExtra as number) || 0);
      return {
        id: String(c.id),
        name: c.name as string,
        lat,
        lon,
        beds: beds || null,
        serviceLevel: SERVICE_LABEL[(c.serviceLevel as string) ?? ""] ?? null,
        dnt: Boolean(c.dntCabin),
        url: `https://ut.no/hytte/${c.id}`,
      };
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const page1 = await fetchPage();
    const allEdges = [...page1.edges];

    if (page1.hasNextPage && page1.endCursor) {
      const page2 = await fetchPage(page1.endCursor);
      allEdges.push(...page2.edges);
    }

    return NextResponse.json({ huts: normalizeEdges(allEdges), fallback: false });
  } catch (e) {
    console.warn("[huts] API unavailable, serving fallback snapshot:", String(e));
    return NextResponse.json({ huts: FALLBACK_HUTS, fallback: true });
  }
}
