export const runtime = "nodejs";

const UT_NO_API = "https://api.ut.no/";
const USER_AGENT = "Friluftskompis/1.0 hackathon";

export interface RouteDetail {
  id: number;
  name: string;
  grading: string | null;
  descriptionPlain: string | null;
  placeA: string | null;
  placeVia: string | null;
  placeB: string | null;
  distance: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  elevationMax: number | null;
  duration: { minutes: number | null; hours: number | null; days: number | null } | null;
  geometry: GeoJSON.LineString | null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (!numId) return Response.json({ error: "Invalid id" }, { status: 400 });

  const res = await fetch(UT_NO_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
    body: JSON.stringify({
      query: `query GetRoute($id: Int!) {
        ntb_getRoute(id: $id) {
          id name grading descriptionPlain placeA placeVia placeB
          distance elevationGain elevationLoss elevationMax
          duration { minutes hours days }
          geometry
        }
      }`,
      variables: { id: numId },
    }),
  });

  const json = (await res.json()) as {
    data?: { ntb_getRoute: RouteDetail | null };
    errors?: unknown[];
  };

  if (json.errors || !json.data?.ntb_getRoute) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(json.data.ntb_getRoute);
}
