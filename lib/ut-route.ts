const UT_NO_API = "https://api.ut.no/";
const USER_AGENT = "Friluftskompis/1.0 hackathon";

export type Coord = { lat: number; lon: number };

const round4 = (n: number) => Math.round(n * 10000) / 10000;

/**
 * Look up a UT.no route by id and return a representative point on its
 * geometry — the midpoint of the LineString. Used as the query coordinate
 * for the met.no forecast.
 *
 * Returns null when the route, geometry, or coordinates are missing.
 */
export async function getRouteMidpoint(id: number): Promise<Coord | null> {
  try {
    const res = await fetch(UT_NO_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        query: `query GetRoute($id: Int!) { ntb_getRoute(id: $id) { geometry } }`,
        variables: { id },
      }),
      next: { revalidate: 86400 },
    });
    const json = (await res.json()) as {
      data?: {
        ntb_getRoute?: {
          geometry?: { type?: string; coordinates?: number[][] } | null;
        } | null;
      };
    };
    const coords = json?.data?.ntb_getRoute?.geometry?.coordinates;
    if (!coords || coords.length === 0) return null;
    const mid = coords[Math.floor(coords.length / 2)];
    if (!Array.isArray(mid) || mid.length < 2) return null;
    const [lon, lat] = mid;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    return { lat: round4(lat), lon: round4(lon) };
  } catch (err) {
    console.error("[ut-route] error:", err);
    return null;
  }
}
