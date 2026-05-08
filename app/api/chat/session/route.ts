import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

type SessionUser = { id?: string; name?: string | null };

/** GET /api/chat/session — load a specific trip by ?tripId=, or return null */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser | undefined)?.id;
  if (!userId) return Response.json({ trip: null });

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  if (!tripId) return Response.json({ trip: null });

  // Verify the user has access to this trip
  const userTrip = await prisma.userTrip.findFirst({
    where: { userId, tripId },
    include: {
      trip: {
        select: {
          id: true,
          chatState: true,
          planningFields: true,
          suggestions: true,
        },
      },
    },
  });

  if (!userTrip) return Response.json({ trip: null });

  return Response.json({ trip: userTrip.trip });
}

/** PATCH /api/chat/session — upsert the in-progress planning trip */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser | undefined)?.id;
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    tripId?: string;
    chatState?: unknown;
    planningFields?: unknown;
    suggestions?: unknown;
  };

  const { tripId, chatState, planningFields, suggestions } = body;

  // Derive a title from planning fields if available
  const pf = planningFields as Record<string, unknown> | null | undefined;
  const title = pf?.region
    ? `Tur til ${pf.region}${pf.days ? ` · ${pf.days} dager` : ""}`
    : "Planlegger tur…";

  let trip;
  if (tripId) {
    // Update existing trip — only update fields that are provided
    trip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(chatState !== undefined && { chatState: chatState as object }),
        ...(planningFields !== undefined && { planningFields: planningFields as object, title }),
        ...(suggestions !== undefined && { suggestions: suggestions as object }),
      },
      select: { id: true },
    });
  } else {
    // Create new trip and link user
    trip = await prisma.trip.create({
      data: {
        title,
        status: "PLANNING",
        chatState: chatState as object ?? [],
        planningFields: planningFields as object ?? {},
        ...(suggestions !== undefined && { suggestions: suggestions as object }),
        participants: {
          create: { userId, status: "ACCEPTED" },
        },
      },
      select: { id: true },
    });
  }

  return Response.json({ tripId: trip.id });
}
