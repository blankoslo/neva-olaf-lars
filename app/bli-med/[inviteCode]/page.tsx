import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { Stamp } from "../../_components/wilhelm";
import JoinButton from "./JoinButton";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const trip = await prisma.trip.findUnique({
    where: { inviteCode },
    include: {
      participants: { include: { user: { select: { id: true, name: true } } } },
      stages: { orderBy: { dayNumber: "asc" } },
    },
  });

  if (!trip) notFound();

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const alreadyJoined =
    userId != null &&
    trip.participants.some((p) => p.userId === userId && p.status === "ACCEPTED");

  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
      : null;

  return (
    <main style={{ paddingTop: 24 }}>
      <div className="page-pad">
        <div className="flex-row between center">
          <Link href="/" className="pill" style={{ textDecoration: "none" }}>
            ← HJEM
          </Link>
          <Stamp color="#5b6b5a" rotate={-2}>· Invitasjon ·</Stamp>
        </div>

        <h1
          style={{
            fontSize: 34,
            lineHeight: 1,
            marginTop: 18,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          {trip.title}
          {trip.area && (
            <>
              <br />
              <em style={{ fontSize: 22 }}>{trip.area}</em>
            </>
          )}
        </h1>

        {(trip.startDate || trip.endDate) && (
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            {[formatDate(trip.startDate), formatDate(trip.endDate)]
              .filter(Boolean)
              .join(" → ")}
            {" · "}
            {trip.stages.length} ETAPPER
          </div>
        )}

        {trip.description && (
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5, opacity: 0.8 }}>
            {trip.description}
          </p>
        )}
      </div>

      {/* Stages */}
      {trip.stages.length > 0 && (
        <section style={{ margin: "20px 18px 0" }}>
          <div
            className="mono"
            style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.5, marginBottom: 8 }}
          >
            ETAPPER
          </div>
          {trip.stages.map((s) => (
            <div
              key={s.id}
              style={{
                padding: "10px 14px",
                marginBottom: 8,
                background: "#fff8ea",
                border: "1px solid rgba(26,31,26,.12)",
                borderRadius: 4,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 14 }}>
                Dag {s.dayNumber} · {s.fromLocation} → {s.toLocation}
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.55, marginTop: 4 }}>
                {[
                  s.distanceKm != null && `${s.distanceKm} KM`,
                  s.durationMinutes != null &&
                    `${Math.floor(s.durationMinutes / 60)} T ${s.durationMinutes % 60 || ""}`.trim(),
                  s.elevationGainM != null && `↑ ${s.elevationGainM} M`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              {s.hutName && (
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", opacity: 0.55, marginTop: 2 }}>
                  HYTTE: {s.hutName.toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Participants */}
      <section style={{ margin: "20px 18px 0" }}>
        <div
          className="mono"
          style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.5, marginBottom: 8 }}
        >
          DELTAKERE ({trip.participants.filter((p) => p.status === "ACCEPTED").length} AV{" "}
          {trip.participants.length})
        </div>
        {trip.participants.map((p) => (
          <div
            key={p.userId}
            className="flex-row between center"
            style={{
              padding: "8px 14px",
              marginBottom: 6,
              background: "#fff8ea",
              border: "1px solid rgba(26,31,26,.12)",
              borderRadius: 4,
            }}
          >
            <span style={{ fontSize: 14 }}>{p.user.name ?? p.user.id}</span>
            <span
              className="mono"
              style={{
                fontSize: 9,
                letterSpacing: ".14em",
                opacity: 0.55,
              }}
            >
              {p.status === "ACCEPTED" ? "DELTAR" : p.status === "DECLINED" ? "TAKKET NEI" : "INVITERT"}
            </span>
          </div>
        ))}
      </section>

      {/* Join CTA */}
      <section style={{ margin: "24px 18px 48px" }}>
        {alreadyJoined ? (
          <div
            className="mono"
            style={{
              textAlign: "center",
              fontSize: 11,
              letterSpacing: ".18em",
              opacity: 0.6,
              padding: "14px 0",
            }}
          >
            DU ER MED PÅ TUREN ✓
          </div>
        ) : userId ? (
          <JoinButton inviteCode={inviteCode} tripId={trip.id} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: ".16em",
                textAlign: "center",
                opacity: 0.6,
                margin: 0,
              }}
            >
              LOGG INN ELLER REGISTRER DEG FOR Å BLI MED
            </p>
            <Link
              href={`/register?callbackUrl=/bli-med/${inviteCode}`}
              className="btn-ember"
              style={{ textAlign: "center", textDecoration: "none", display: "block" }}
            >
              Registrer meg
            </Link>
            <Link
              href={`/login?callbackUrl=/bli-med/${inviteCode}`}
              className="pill"
              style={{ textAlign: "center", textDecoration: "none", display: "block" }}
            >
              Jeg har konto — logg inn
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
