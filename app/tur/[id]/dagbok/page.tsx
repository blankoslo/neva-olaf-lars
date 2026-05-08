import { notFound } from "next/navigation";
import Link from "next/link";
import { WilhelmAvatar } from "../../../_components/wilhelm";
import TabBar from "../../../_components/tabbar";
import prisma from "../../../../lib/prisma";

type RouteSuggestion = {
  title: string;
  pitch: string;
  routes: { id: number; name: string; placeA: string | null; placeB: string | null; placeVia: string | null }[];
};

export default async function TripDagbokPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id }, select: { title: true, selectedSuggestion: true, planningFields: true } });
  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const fields = (trip.planningFields ?? {}) as Record<string, string | number | null | undefined>;

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href={`/tur/${id}`} className="pill" style={{ textDecoration: "none" }}>
              ← TILBAKE
            </Link>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
              DAGBOK
            </div>
          </div>
          <h1
            style={{
              marginTop: 18,
              fontSize: 30,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {trip.title || "Din tur"}
          </h1>
          {fields.region && (
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}>
              {String(fields.region).toUpperCase()}
              {fields.days ? ` · ${String(fields.days)} DAGER` : ""}
            </div>
          )}
        </div>

        {selected ? (
          <>
            <section
              className="mx-frame"
              style={{
                marginTop: 18,
                marginBottom: 24,
                padding: "14px 16px",
                background: "rgba(233,227,211,0.04)",
                border: "1px solid rgba(233,227,211,0.10)",
                borderRadius: 4,
                transform: "rotate(-0.6deg)",
              }}
            >
              <div className="flex-row gap-3 center">
                <WilhelmAvatar size={40} variant="ink" />
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", opacity: 0.6 }}>
                  VALGT TUR · WILHELM
                </div>
              </div>
              <p
                className="serif italic"
                style={{
                  marginTop: 10,
                  fontSize: 18,
                  color: "var(--bone-2)",
                  lineHeight: 1.18,
                  marginBottom: 0,
                }}
              >
                {selected.pitch}
              </p>
            </section>

            <section className="mx-frame" style={{ marginTop: 8 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginBottom: 12 }}>
                ─── ETAPPER
              </div>
              {selected.routes.map((r, i) => (
                <div
                  key={r.id}
                  style={{
                    borderBottom: "1px dashed rgba(233,227,211,.10)",
                    padding: "10px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 9, letterSpacing: ".2em",
                      color: "var(--ember)", opacity: 0.7,
                      minWidth: 20,
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div className="serif" style={{ fontSize: 16, color: "var(--bone)" }}>{r.name}</div>
                    {(r.placeA || r.placeB) && (
                      <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--slate)", marginTop: 2 }}>
                        {[r.placeA, r.placeVia, r.placeB].filter(Boolean).join(" → ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          </>
        ) : (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", padding: "24px 0", letterSpacing: ".14em" }}
            >
              INGEN TUR VALGT ENNÅ
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}

