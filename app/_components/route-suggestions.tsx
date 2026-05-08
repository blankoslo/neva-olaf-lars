"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Glyph } from "./glyph";

/* Lazy-load the Leaflet map to avoid SSR issues */
const RouteMap = dynamic(() => import("./route-map"), { ssr: false, loading: () => <MapSkeleton /> });

export type UtRouteSummary = {
  id: number;
  name: string;
  grading: "EASY" | "MODERATE" | "TOUGH" | "VERY_TOUGH" | null;
  descriptionPlain: string | null;
  placeA: string | null;
  placeVia: string | null;
  placeB: string | null;
  distance: number | null;
  elevationGain: number | null;
  duration: { minutes: number | null; hours: number | null; days: number | null } | null;
};

export type RouteSuggestion = {
  routeIds: number[];
  title: string;
  pitch: string;
  routes: UtRouteSummary[];
};

type RouteDetail = {
  id: number;
  name: string;
  geometry: GeoJSON.LineString | null;
  distance: number | null;
  elevationGain: number | null;
  elevationLoss: number | null;
  elevationMax: number | null;
  duration: { minutes: number | null; hours: number | null; days: number | null } | null;
  descriptionPlain: string | null;
  placeA: string | null;
  placeVia: string | null;
  placeB: string | null;
  grading: string | null;
};

const GRADING_LABEL: Record<string, string> = {
  EASY: "Lett",
  MODERATE: "Moderat",
  TOUGH: "Krevende",
  VERY_TOUGH: "Svært krevende",
};

const GRADING_COLOR: Record<string, string> = {
  EASY: "#4a8c4a",
  MODERATE: "#c8870a",
  TOUGH: "#c0401a",
  VERY_TOUGH: "#8b1a1a",
};

function formatDuration(d: UtRouteSummary["duration"]): string {
  if (!d) return "";
  if (d.days) return `${d.days} dag${d.days > 1 ? "er" : ""}`;
  if (d.hours) {
    const mins = d.minutes ? `:${String(d.minutes).padStart(2, "0")}` : "";
    return `${d.hours}${mins} t`;
  }
  if (d.minutes) return `${d.minutes} min`;
  return "";
}

function MapSkeleton() {
  return (
    <div style={{ height: 240, background: "#d8d3c4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="mono" style={{ fontSize: 10, opacity: 0.4, letterSpacing: ".18em" }}>LASTER KART…</span>
    </div>
  );
}

/* ── Preview sheet (slide-up drawer) ── */
export function RoutePreviewSheet({
  suggestion,
  onClose,
}: {
  suggestion: RouteSuggestion;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<RouteDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fetch geometry for all routes in this suggestion
  useEffect(() => {
    let cancelled = false;
    setLoadingDetails(true);
    Promise.all(
      suggestion.routeIds.map((id) =>
        fetch(`/api/routes/${id}`).then((r) => r.json() as Promise<RouteDetail>),
      ),
    ).then((data) => {
      if (!cancelled) {
        setDetails(data.filter((d) => !("error" in d)));
        setLoadingDetails(false);
      }
    }).catch(() => {
      if (!cancelled) setLoadingDetails(false);
    });
    return () => { cancelled = true; };
  }, [suggestion.routeIds]);

  // Close on backdrop click
  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const geometries = details.map((d) => d.geometry).filter(Boolean) as GeoJSON.LineString[];

  return (
    <div
      onClick={onBackdropClick}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(21,24,26,0.55)",
        display: "flex", alignItems: "flex-end",
      }}
    >
      <div
        ref={sheetRef}
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          background: "#ede4d3",
          borderRadius: "12px 12px 0 0",
          overflow: "hidden",
          maxHeight: "92dvh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -4px 32px rgba(21,24,26,0.18)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(26,31,26,.2)" }} />
        </div>

        {/* Map */}
        <div style={{ height: 240, flexShrink: 0, position: "relative" }}>
          {loadingDetails ? (
            <MapSkeleton />
          ) : (
            <RouteMap geometries={geometries} />
          )}
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 10, right: 10, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(237,228,211,.92)", border: "1px solid rgba(26,31,26,.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Lukk"
          >
            <Glyph name="close" size={14} color="#15181a" />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 18px 32px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
            {suggestion.title}
          </h2>
          <p style={{ fontSize: 14, color: "rgba(26,31,26,.72)", lineHeight: 1.5, margin: "0 0 18px" }}>
            {suggestion.pitch}
          </p>

          {suggestion.routes.map((route, i) => (
            <RouteDetailCard
              key={route.id}
              route={route}
              detail={details.find((d) => d.id === route.id) ?? null}
              dayLabel={suggestion.routes.length > 1 ? `Dag ${i + 1}` : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteDetailCard({
  route,
  detail,
  dayLabel,
}: {
  route: UtRouteSummary;
  detail: RouteDetail | null;
  dayLabel: string | null;
}) {
  const grading = route.grading ?? "EASY";
  const duration = formatDuration(detail?.duration ?? route.duration);
  const dist = detail?.distance ? `${(detail.distance / 1000).toFixed(1)} km` : null;
  const gain = detail?.elevationGain ? `+${detail.elevationGain} m` : null;
  const loss = detail?.elevationLoss ? `−${detail.elevationLoss} m` : null;

  return (
    <div
      style={{
        border: "1px solid rgba(26,31,26,.14)",
        borderRadius: 4,
        padding: "12px 14px",
        marginBottom: 10,
        background: "#fff8ea",
        boxShadow: "0 1px 0 rgba(26,31,26,.08)",
      }}
    >
      {dayLabel && (
        <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", opacity: 0.5, marginBottom: 4 }}>
          {dayLabel.toUpperCase()}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.3, marginBottom: 4 }}>
        {route.name}
      </div>

      {(route.placeA || route.placeB) && (
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", opacity: 0.5, marginBottom: 8 }}>
          {[route.placeA, route.placeVia, route.placeB].filter(Boolean).join(" → ")}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        {duration && <StatPill label="tid" value={duration} />}
        {dist && <StatPill label="lengde" value={dist} />}
        {gain && <StatPill label="opp" value={gain} />}
        {loss && <StatPill label="ned" value={loss} />}
      </div>

      <span
        className="mono"
        style={{
          fontSize: 9, letterSpacing: ".18em",
          color: GRADING_COLOR[grading] ?? "#666",
          background: `${GRADING_COLOR[grading] ?? "#666"}18`,
          padding: "2px 6px", borderRadius: 2,
        }}
      >
        {GRADING_LABEL[grading] ?? grading}
      </span>

      {(detail?.descriptionPlain ?? route.descriptionPlain) && (
        <p style={{ fontSize: 13, color: "rgba(26,31,26,.65)", lineHeight: 1.45, margin: "10px 0 0" }}>
          {(detail?.descriptionPlain ?? route.descriptionPlain)!.slice(0, 300)}
          {((detail?.descriptionPlain ?? route.descriptionPlain)!.length > 300) ? "…" : ""}
        </p>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(26,31,26,.06)", borderRadius: 3, padding: "3px 8px", gap: 1 }}>
      <span className="mono" style={{ fontSize: 8, letterSpacing: ".14em", opacity: 0.5 }}>{label.toUpperCase()}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ── Suggestion card (shown in the list) ── */
export function SuggestionCard({
  suggestion,
  index,
  onPreview,
}: {
  suggestion: RouteSuggestion;
  index: number;
  onPreview: () => void;
}) {
  const totalHours = suggestion.routes.reduce((sum, r) => sum + (r.duration?.hours ?? 0), 0);
  const durationText = totalHours > 0 ? `${totalHours} t totalt` : "";
  const gradingPriority: Record<string, number> = { VERY_TOUGH: 4, TOUGH: 3, MODERATE: 2, EASY: 1 };
  const hardest = suggestion.routes.reduce<string | null>((best, r) => {
    if (!r.grading) return best;
    if (!best) return r.grading;
    return (gradingPriority[r.grading] ?? 0) > (gradingPriority[best] ?? 0) ? r.grading : best;
  }, null);

  return (
    <li
      style={{
        background: "#fff8ea",
        border: "1px solid rgba(26,31,26,.14)",
        borderRadius: 4,
        boxShadow: "0 1px 0 rgba(26,31,26,.08)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={onPreview}
        style={{
          width: "100%", textAlign: "left", padding: "14px 14px 12px",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", opacity: 0.45, marginBottom: 4 }}>
              FORSLAG {index + 1}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3 }}>{suggestion.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginTop: 2 }}>
            {durationText && (
              <span className="mono" style={{ fontSize: 10, opacity: 0.55 }}>{durationText}</span>
            )}
            <Glyph name="arrow-r" size={14} color="rgba(26,31,26,.4)" />
          </div>
        </div>

        <p style={{ fontSize: 13, color: "rgba(26,31,26,.65)", lineHeight: 1.45, margin: "8px 0 10px" }}>
          {suggestion.pitch}
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {suggestion.routes.length > 1 && (
            <span className="mono" style={{ fontSize: 9, letterSpacing: ".16em", background: "rgba(26,31,26,.07)", padding: "2px 6px", borderRadius: 2 }}>
              {suggestion.routes.length} ETAPPER
            </span>
          )}
          {hardest && (
            <span
              className="mono"
              style={{
                fontSize: 9, letterSpacing: ".16em",
                color: GRADING_COLOR[hardest] ?? "#666",
                background: `${GRADING_COLOR[hardest] ?? "#666"}18`,
                padding: "2px 6px", borderRadius: 2,
              }}
            >
              {GRADING_LABEL[hardest] ?? hardest}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

/* ── SuggestionList with sheet controller ── */
export function SuggestionList({
  suggestions,
  loading,
  region,
}: {
  suggestions: RouteSuggestion[] | null;
  loading: boolean;
  region: string | null;
}) {
  const [open, setOpen] = useState<RouteSuggestion | null>(null);

  return (
    <>
      <section className="mx-frame" style={{ marginTop: 24, marginBottom: 40 }}>
        <div
          className="mono"
          style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6, marginBottom: 10 }}
        >
          TURFORSLAG · UT.NO{region ? ` · ${region.toUpperCase()}` : ""}
        </div>

        {loading && (
          <div className="mono" style={{ fontSize: 11, opacity: 0.5, textAlign: "center", padding: "20px 0" }}>
            Wilhelm leter etter ruter…
          </div>
        )}

        {!loading && suggestions !== null && suggestions.length === 0 && (
          <div className="mono" style={{ fontSize: 11, opacity: 0.5, textAlign: "center", padding: "20px 0" }}>
            Fant ingen ruter i dette området.
          </div>
        )}

        {!loading && suggestions && suggestions.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map((s, i) => (
              <SuggestionCard
                key={s.routeIds.join("-")}
                suggestion={s}
                index={i}
                onPreview={() => setOpen(s)}
              />
            ))}
          </ul>
        )}
      </section>

      {open && (
        <RoutePreviewSheet suggestion={open} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
