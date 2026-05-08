import Link from "next/link";
import { notFound } from "next/navigation";
import TabBar from "../../_components/tabbar";
import { WeatherStrip } from "../../_components/weather-strip";
import ReviewsList from "../../_components/reviews-list";
import prisma from "../../../lib/prisma";
import { getRouteMidpoint } from "../../../lib/ut-route";
import { getForecast } from "../../../lib/weather";

type RouteSuggestion = {
  routeIds: number[];
  title: string;
  pitch: string;
  routes: {
    id: number;
    name: string;
    grading: string | null;
    distance: number | null;
    elevationGain: number | null;
    duration: { hours: number | null; minutes: number | null; days: number | null } | null;
    placeA: string | null;
    placeVia: string | null;
    placeB: string | null;
    descriptionPlain: string | null;
  }[];
};

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Moderat",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

export default async function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const fields = (trip.planningFields ?? {}) as Record<string, string | number | null | undefined>;

  // Trip duration drives forecast length, capped to met.no's useful window.
  const tripDays =
    typeof fields.days === "number"
      ? fields.days
      : Number(fields.days) || selected?.routes.length || 7;
  const forecastDays = Math.min(7, Math.max(3, tripDays));

  // Use the first route's midpoint as the representative coordinate.
  const firstRouteId = selected?.routes?.[0]?.id ?? null;
  const coord = firstRouteId != null ? await getRouteMidpoint(firstRouteId) : null;
  const forecast = coord ? await getForecast(coord.lat, coord.lon, forecastDays) : [];

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href="/" className="pill" style={{ textDecoration: "none" }}>
              ← TILBAKE
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
            {trip.title || "Din tur"}
          </h1>
          {fields.region && (
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}>
              {String(fields.region).toUpperCase()}
              {fields.days ? ` · ${String(fields.days)} DAGER` : ""}
            </div>
          )}
        </div>

        {forecast.length > 0 && (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="flex-row between center" style={{ marginBottom: 10 }}>
              <div className="eyebrow muted">VÊRET</div>
              {coord && (
                <div
                  className="mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: ".18em",
                    color: "var(--slate)",
                  }}
                >
                  {coord.lat.toFixed(2)}° N · {coord.lon.toFixed(2)}° Ø
                </div>
              )}
            </div>
            <WeatherStrip days={forecast} />
          </section>
        )}

        {selected ? (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 12 }}>
              VALGT TUR
            </div>
            <div
              style={{
                background: "rgba(233,227,211,.04)",
                border: "1px solid rgba(244,162,89,.22)",
                borderRadius: 6,
                padding: "14px 16px",
              }}
            >
              <div className="display" style={{ fontSize: 22, lineHeight: 1.2, color: "var(--bone)", marginBottom: 8 }}>
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
                    <div className="eyebrow muted" style={{ marginBottom: 4 }}>DAG {j + 1}</div>
                  )}
                  <div className="serif" style={{ fontSize: 17, color: "var(--bone)", marginBottom: 4 }}>{r.name}</div>
                  {(r.placeA || r.placeB) && (
                    <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--slate)", marginBottom: 6 }}>
                      {[r.placeA, r.placeVia, r.placeB].filter(Boolean).join(" \u2192 ")}
                    </div>
                  )}
                  {r.grading && (
                    <span className="mono" style={{ fontSize: 9, letterSpacing: ".16em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                      {GRADING_LABEL[r.grading] ?? r.grading}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
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

        <ReviewsList tripId={id} />

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}
