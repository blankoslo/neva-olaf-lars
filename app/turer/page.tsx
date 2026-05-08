import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import TabBar from "../_components/tabbar";
import { RepeatTripButton } from "../tur/[id]/_components/RepeatTripButton";

function formatDate(d: Date | null) {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function totalStats(stages: { distanceKm: number | null; elevationGainM: number | null }[]) {
  const km = stages.reduce((s, x) => s + (x.distanceKm ?? 0), 0);
  const hm = stages.reduce((s, x) => s + (x.elevationGainM ?? 0), 0);
  return { km: Math.round(km * 10) / 10, hm };
}

export default async function TurerPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <>
        <main style={{ paddingTop: 24 }}>
          <div className="page-pad">
            <h1 style={{ fontSize: 28, fontWeight: 400 }}>Turer</h1>
            <p style={{ color: "var(--slate)", marginTop: 12 }}>
              Du må være innlogget for å se turene dine.{" "}
              <Link href="/profil" style={{ color: "var(--ember)" }}>Logg inn</Link>
            </p>
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  const userTrips = await prisma.userTrip.findMany({
    where: { userId, status: "ACCEPTED" },
    include: {
      trip: {
        include: {
          stages: true,
          participants: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
    orderBy: { trip: { startDate: "desc" } },
  });

  const completedTrips = userTrips
    .map((ut) => ut.trip)
    .filter((t) => t.status === "COMPLETED");

  const planningTrips = userTrips
    .map((ut) => ut.trip)
    .filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");

  // Check for proactive repeat suggestions: completed trips ~1 year ago (±45 days)
  const now = new Date();
  const repeatSuggestions = completedTrips.filter((t) => {
    if (!t.startDate) return false;
    const diff = now.getTime() - t.startDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 320 && days <= 410;
  });

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
              TURER
            </div>
            <Link
              href="/statistikk"
              style={{
                fontSize: 10,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: ".14em",
                color: "var(--ember)",
                textDecoration: "none",
              }}
            >
              STATISTIKK →
            </Link>
          </div>
          <h1
            style={{
              marginTop: 12,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Dine <em>turer.</em>
          </h1>
        </div>

        {/* Proactive repeat suggestions */}
        {repeatSuggestions.length > 0 && (
          <section className="mx-frame" style={{ marginTop: 20 }}>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>SESONGEN NÆRMER SEG</div>
            {repeatSuggestions.map((t) => {
              const stats = totalStats(t.stages);
              return (
                <div
                  key={t.id}
                  style={{
                    background: "rgba(163,196,160,.08)",
                    border: "1px solid rgba(163,196,160,.3)",
                    borderRadius: 8,
                    padding: "14px 16px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    className="mono"
                    style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--moss)", marginBottom: 4 }}
                  >
                    ↺ FORSLAG OM GJENTAKELSE
                  </div>
                  <div className="display" style={{ fontSize: 18, color: "var(--bone)", marginBottom: 4 }}>
                    {t.title}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--slate)", marginBottom: 12 }}>
                    {formatDate(t.startDate)}
                    {stats.km > 0 && ` · ${stats.km} KM`}
                    {stats.hm > 0 && ` · ${stats.hm} HM`}
                  </div>
                  <RepeatTripButton tripId={t.id} />
                </div>
              );
            })}
          </section>
        )}

        {/* Active / planning trips */}
        {planningTrips.length > 0 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>
              AKTIVE TURER · {planningTrips.length}
            </div>
            {planningTrips.map((t) => (
              <Link
                key={t.id}
                href={`/tur/${t.id}`}
                style={{ textDecoration: "none", display: "block", marginBottom: 8 }}
              >
                <div
                  style={{
                    background: "rgba(244,162,89,.05)",
                    border: "1px solid rgba(244,162,89,.15)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div className="display" style={{ fontSize: 17, color: "var(--bone)" }}>{t.title}</div>
                    {t.startDate && (
                      <div className="mono" style={{ fontSize: 10, color: "var(--slate)", marginTop: 2 }}>
                        {formatDate(t.startDate)}
                      </div>
                    )}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 9,
                      letterSpacing: ".14em",
                      color: t.status === "ACTIVE" ? "var(--ember)" : "var(--slate)",
                      background: "rgba(233,227,211,.07)",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {t.status === "ACTIVE" ? "AKTIV" : "PLANLEGGES"}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Completed trips */}
        {completedTrips.length > 0 ? (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>
              GJENNOMFØRTE TURER · {completedTrips.length}
            </div>
            {completedTrips.map((t) => {
              const stats = totalStats(t.stages);
              const fields = (t.planningFields ?? {}) as Record<string, string | number | null | undefined>;
              return (
                <Link
                  key={t.id}
                  href={`/tur/${t.id}`}
                  style={{ textDecoration: "none", display: "block", marginBottom: 10 }}
                >
                  <div
                    style={{
                      background: "rgba(233,227,211,.04)",
                      border: "1px solid rgba(233,227,211,.1)",
                      borderRadius: 8,
                      padding: "14px 16px",
                      transition: "border-color .15s",
                    }}
                  >
                    <div
                      className="mono"
                      style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--slate)", marginBottom: 4 }}
                    >
                      {formatDate(t.startDate)}
                      {t.endDate && t.startDate && ` — ${formatDate(t.endDate)}`}
                    </div>
                    <div className="display" style={{ fontSize: 20, color: "var(--bone)", marginBottom: 6 }}>
                      {t.title}
                    </div>
                    {(fields.region || stats.km > 0) && (
                      <div className="mono" style={{ fontSize: 10, color: "var(--slate)", marginBottom: 10 }}>
                        {fields.region ? String(fields.region).toUpperCase() : ""}
                        {stats.km > 0 ? ` · ${stats.km} KM` : ""}
                        {stats.hm > 0 ? ` · ${stats.hm} HM` : ""}
                        {t.stages.length > 0 ? ` · ${t.stages.length} ETAPPER` : ""}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {t.participants.slice(0, 5).map((p) => (
                        <div
                          key={p.userId}
                          style={{
                            fontSize: 10,
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: ".1em",
                            background: "rgba(233,227,211,.07)",
                            borderRadius: 999,
                            padding: "2px 10px",
                            color: "var(--bone-2)",
                          }}
                        >
                          {p.user.name ?? p.user.email.split("@")[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", padding: "32px 0", letterSpacing: ".14em" }}
            >
              INGEN FULLFØRTE TURER ENNÅ
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}
