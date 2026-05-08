import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { Stamp } from "../../_components/wilhelm";
import InviteMap from "./InviteMap";
import JoinButton from "./JoinButton";

type RouteSuggestion = {
  routeIds: number[];
  title: string;
  pitch: string;
  routes: {
    id: number;
    name: string;
    grading: string | null;
    placeA: string | null;
    placeVia: string | null;
    placeB: string | null;
    distance: number | null;
    elevationGain: number | null;
    duration: { hours: number | null; minutes: number | null; days: number | null } | null;
  }[];
};

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Moderat",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

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
    // also grab selectedSuggestion
  });

  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const fields = (trip.planningFields ?? {}) as Record<string, string | number | null | undefined>;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const alreadyJoined =
    userId != null &&
    trip.participants.some((p) => p.userId === userId && p.status === "ACCEPTED");

  const accepted = trip.participants.filter((p) => p.status === "ACCEPTED").length;

  const formatDate = (d: Date | null) =>
    d
      ? d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
      : null;

  return (
    <main style={{ paddingTop: 24, paddingBottom: 120 }}>
      {/* Header */}
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
              <em style={{ fontSize: 24, color: "var(--bone-2)" }}>{trip.area}</em>
            </>
          )}
        </h1>

        <div
          className="mono"
          style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          {(trip.startDate || trip.endDate) && (
            <span>
              {[formatDate(trip.startDate), formatDate(trip.endDate)].filter(Boolean).join(" → ")}
            </span>
          )}
          {fields.days && <span>{String(fields.days)} DAGER</span>}
          {trip.stages.length > 0 && <span>{trip.stages.length} ETAPPER</span>}
          <span>{accepted} AV {trip.participants.length} DELTAR</span>
        </div>

        {trip.description && (
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, opacity: 0.8 }}>
            {trip.description}
          </p>
        )}
      </div>

      {/* Map */}
      <div className="map-wrap" style={{ height: 220 }}>
        <InviteMap routeIds={selected?.routeIds ?? []} />
      </div>

      {/* Selected route / stages */}
      {selected ? (
        <section className="page-pad" style={{ marginTop: 24 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.5, marginBottom: 10 }}>
            PLANLAGT RUTE
          </div>
          <div
            style={{
              background: "rgba(233,227,211,.04)",
              border: "1px solid rgba(244,162,89,.22)",
              borderRadius: 6,
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 400, letterSpacing: "-0.01em", color: "var(--bone)", marginBottom: 6 }}>
              {selected.title}
            </div>
            <p style={{ fontSize: 13, color: "var(--bone-2)", lineHeight: 1.5, margin: "0 0 14px" }}>
              {selected.pitch}
            </p>
            {selected.routes.map((r, j) => (
              <div
                key={r.id}
                style={{
                  borderTop: j > 0 ? "1px solid rgba(233,227,211,.08)" : undefined,
                  paddingTop: j > 0 ? 10 : 0,
                  marginTop: j > 0 ? 10 : 0,
                }}
              >
                {selected.routes.length > 1 && (
                  <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", opacity: 0.5, marginBottom: 3 }}>
                    DAG {j + 1}
                  </div>
                )}
                <div style={{ fontSize: 16, color: "var(--bone)", marginBottom: 4 }}>{r.name}</div>
                {(r.placeA || r.placeB) && (
                  <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--slate)", marginBottom: 4 }}>
                    {[r.placeA, r.placeVia, r.placeB].filter(Boolean).join(" → ")}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {r.grading && (
                    <span className="mono" style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                      {GRADING_LABEL[r.grading] ?? r.grading}
                    </span>
                  )}
                  {r.distance != null && (
                    <span className="mono" style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                      {r.distance} KM
                    </span>
                  )}
                  {r.elevationGain != null && (
                    <span className="mono" style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                      ↑ {r.elevationGain} M
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : trip.stages.length > 0 ? (
        <section className="page-pad" style={{ marginTop: 24 }}>
          <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.5, marginBottom: 10 }}>
            ETAPPER
          </div>
          {trip.stages.map((s) => (
            <div
              key={s.id}
              style={{
                padding: "10px 14px",
                marginBottom: 8,
                background: "rgba(233,227,211,.04)",
                border: "1px solid rgba(233,227,211,.10)",
                borderRadius: 4,
              }}
            >
              <div style={{ fontWeight: 500, fontSize: 14, color: "var(--bone)" }}>
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
      ) : null}

      {/* Participants */}
      <section className="page-pad" style={{ marginTop: 24 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.5, marginBottom: 10 }}>
          TURFØLGET · {accepted} AV {trip.participants.length} DELTAR
        </div>
        {trip.participants.length === 0 ? (
          <div className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".14em", padding: "12px 0" }}>
            INGEN DELTAKERE ENNÅ
          </div>
        ) : (
          trip.participants.map((p) => (
            <div
              key={p.userId}
              className="flex-row between center"
              style={{
                padding: "10px 0",
                borderBottom: "1px dashed rgba(233,227,211,.10)",
              }}
            >
              <span style={{ fontSize: 15, color: "var(--bone)" }}>{p.user.name ?? "Ukjent"}</span>
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: ".14em",
                  padding: "2px 8px",
                  borderRadius: 999,
                  background:
                    p.status === "ACCEPTED"
                      ? "rgba(163,196,160,.14)"
                      : p.status === "DECLINED"
                      ? "rgba(193,74,63,.14)"
                      : "rgba(233,227,211,.07)",
                  color:
                    p.status === "ACCEPTED"
                      ? "var(--moss)"
                      : p.status === "DECLINED"
                      ? "var(--ember-2)"
                      : "var(--slate)",
                }}
              >
                {p.status === "ACCEPTED" ? "DELTAR" : p.status === "DECLINED" ? "TAKKET NEI" : "INVITERT"}
              </span>
            </div>
          ))
        )}
      </section>

      {/* Sticky CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 480,
          margin: "0 auto",
          padding: "12px 18px 28px",
          background: "rgba(7,10,20,0.92)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTop: "1px solid rgba(233,227,211,.10)",
          zIndex: 100,
        }}
      >
        {alreadyJoined ? (
          <div
            className="mono"
            style={{ textAlign: "center", fontSize: 11, letterSpacing: ".18em", color: "var(--moss)", padding: "10px 0" }}
          >
            DU ER MED PÅ TUREN ✓
          </div>
        ) : userId ? (
          <JoinButton inviteCode={inviteCode} tripId={trip.id} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p
              className="mono"
              style={{ fontSize: 10, letterSpacing: ".16em", textAlign: "center", opacity: 0.6, margin: 0 }}
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
      </div>
    </main>
  );
}

