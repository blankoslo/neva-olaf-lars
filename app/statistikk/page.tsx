import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import TabBar from "../_components/tabbar";
import { ElevationProfile } from "../_components/elevation-profile";

function formatDate(d: Date | null) {
  if (!d) return "–";
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function tripStats(stages: { distanceKm: number | null; elevationGainM: number | null; durationMinutes: number | null }[]) {
  const km = stages.reduce((s, x) => s + (x.distanceKm ?? 0), 0);
  const hm = stages.reduce((s, x) => s + (x.elevationGainM ?? 0), 0);
  const min = stages.reduce((s, x) => s + (x.durationMinutes ?? 0), 0);
  return {
    km: Math.round(km * 10) / 10,
    hm,
    hours: min > 0 ? `${Math.floor(min / 60)} t ${min % 60} min` : null,
  };
}

function getSeasonLabel(d: Date | null): string {
  if (!d) return "Ukjent";
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  if (month >= 3 && month <= 5) return `Vår ${year}`;
  if (month >= 6 && month <= 8) return `Sommer ${year}`;
  if (month >= 9 && month <= 11) return `Høst ${year}`;
  return `Vinter ${year}`;
}

export default async function StatistikkPage({
  searchParams,
}: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const { compare } = await searchParams;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <>
        <main style={{ paddingTop: 24 }}>
          <div className="page-pad">
            <h1 style={{ fontSize: 28, fontWeight: 400 }}>Statistikk</h1>
            <p style={{ color: "var(--slate)", marginTop: 12 }}>
              Du må være innlogget.{" "}
              <Link href="/login" style={{ color: "var(--ember)" }}>Logg inn</Link>
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
        include: { stages: true },
      },
    },
    orderBy: { trip: { startDate: "asc" } },
  });

  const completedTrips = userTrips
    .map((ut) => ut.trip)
    .filter((t) => t.status === "COMPLETED");

  // Cumulative totals
  const totalKm = completedTrips.reduce((s, t) => s + t.stages.reduce((a, st) => a + (st.distanceKm ?? 0), 0), 0);
  const totalHm = completedTrips.reduce((s, t) => s + t.stages.reduce((a, st) => a + (st.elevationGainM ?? 0), 0), 0);

  // Per season stats
  const seasonMap: Record<string, { km: number; hm: number; count: number }> = {};
  for (const t of completedTrips) {
    const label = getSeasonLabel(t.startDate);
    if (!seasonMap[label]) seasonMap[label] = { km: 0, hm: 0, count: 0 };
    const s = tripStats(t.stages);
    seasonMap[label].km += s.km;
    seasonMap[label].hm += s.hm;
    seasonMap[label].count += 1;
  }
  const seasons = Object.entries(seasonMap);

  // Trip for side-by-side comparison (query param)
  let compareTrip: (typeof completedTrips)[0] | null = null;
  if (compare) {
    compareTrip = completedTrips.find((t) => t.id === compare) ?? null;
  }

  // Most recent completed trip for default profile display
  const latestTrip = completedTrips[completedTrips.length - 1] ?? null;
  const profileTrip = compareTrip ?? latestTrip;

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href="/historikk" className="pill" style={{ textDecoration: "none" }}>
              ← HISTORIKK
            </Link>
          </div>
          <h1
            style={{
              marginTop: 18,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Din <em>statistikk.</em>
          </h1>
        </div>

        {/* Totals */}
        <section className="mx-frame" style={{ marginTop: 20 }}>
          <div className="eyebrow muted" style={{ marginBottom: 12 }}>TOTALT ALLE TURER</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              { label: "TURER", value: completedTrips.length.toString() },
              { label: "KM", value: Math.round(totalKm * 10) / 10 + " km" },
              { label: "HØYDEMETER", value: totalHm > 0 ? totalHm + " hm" : "–" },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(233,227,211,.04)",
                  border: "1px solid rgba(233,227,211,.1)",
                  borderRadius: 8,
                  padding: "14px 10px",
                  textAlign: "center",
                }}
              >
                <div
                  className="display"
                  style={{ fontSize: 26, color: "var(--ember)", lineHeight: 1, marginBottom: 4 }}
                >
                  {value}
                </div>
                <div className="mono" style={{ fontSize: 8, letterSpacing: ".18em", color: "var(--slate)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Per-season breakdown */}
        {seasons.length > 0 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>PER SESONG</div>
            {seasons.map(([season, stats]) => (
              <div
                key={season}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid rgba(233,227,211,.06)",
                }}
              >
                <div>
                  <div className="display" style={{ fontSize: 15, color: "var(--bone)" }}>{season}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: ".14em" }}>
                    {stats.count} {stats.count === 1 ? "TUR" : "TURER"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--bone-2)" }}>
                    {Math.round(stats.km * 10) / 10} km
                  </div>
                  {stats.hm > 0 && (
                    <div className="mono" style={{ fontSize: 10, color: "var(--slate)" }}>
                      {stats.hm} hm ↑
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Elevation profile for most recent (or compared) trip */}
        {profileTrip && profileTrip.stages.length > 0 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 8 }}>
              HØYDEPROFIL · {profileTrip.title.toUpperCase()}
            </div>
            <div
              style={{
                background: "rgba(233,227,211,.03)",
                border: "1px solid rgba(233,227,211,.1)",
                borderRadius: 8,
                padding: "14px 12px",
              }}
            >
              <ElevationProfile stages={profileTrip.stages} />
            </div>
          </section>
        )}

        {/* Side-by-side comparison */}
        {compareTrip && latestTrip && compareTrip.id !== latestTrip.id && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 8 }}>SAMMENLIGNING</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[latestTrip, compareTrip].map((t, i) => {
                const s = tripStats(t.stages);
                return (
                  <div
                    key={t.id}
                    style={{
                      background: "rgba(233,227,211,.03)",
                      border: `1px solid rgba(${i === 0 ? "244,162,89" : "163,196,160"},.2)`,
                      borderRadius: 8,
                      padding: "12px",
                    }}
                  >
                    <div className="display" style={{ fontSize: 13, color: "var(--bone)", marginBottom: 4, lineHeight: 1.2 }}>
                      {t.title}
                    </div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--slate)", marginBottom: 8 }}>
                      {formatDate(t.startDate)}
                    </div>
                    {t.stages.length > 0 && (
                      <ElevationProfile
                        stages={t.stages}
                        color={i === 0 ? "var(--ember)" : "var(--moss)"}
                        height={70}
                      />
                    )}
                    <div className="mono" style={{ fontSize: 10, color: "var(--bone-2)", marginTop: 8 }}>
                      {s.km > 0 && `${s.km} km`}
                      {s.hm > 0 && ` · ${s.hm} hm`}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Compare trip picker */}
        {completedTrips.length > 1 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 8 }}>SAMMENLIGN MED</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {completedTrips.map((t) => (
                <Link
                  key={t.id}
                  href={`/statistikk?compare=${t.id}`}
                  style={{
                    fontSize: 10,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: ".12em",
                    color: compare === t.id ? "var(--night)" : "var(--bone-2)",
                    background: compare === t.id ? "var(--ember)" : "rgba(233,227,211,.07)",
                    borderRadius: 999,
                    padding: "4px 12px",
                    textDecoration: "none",
                    border: "1px solid transparent",
                  }}
                >
                  {t.title.length > 20 ? t.title.substring(0, 20) + "…" : t.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {completedTrips.length === 0 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", padding: "32px 0", letterSpacing: ".14em" }}
            >
              INGEN GJENNOMFØRTE TURER ENNÅ
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}
