"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Types ── */
type Hut = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  beds?: number | null;
  serviceLevel?: string | null;
  dnt?: boolean;
  url?: string;
};

type PlaceResult = {
  name: string;
  type: string;
  lat: number;
  lon: number;
};

type Layer = "topo" | "toporaster";

const TILE: Record<Layer, string> = {
  topo: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
  toporaster:
    "https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png",
};

/* ── Icons ── */
function makeCabinIcon(dnt: boolean) {
  const stroke = dnt ? "#f4a259" : "#a3c4a0";
  return L.divIcon({
    html: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 11l9-7 9 7v9H3z" fill="rgba(10,15,28,0.85)"/>
      <path d="M9 20v-6h6v6"/>
    </svg>`,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -13],
  });
}

/* ── Map helpers ── */
function FlyTo({ target }: { target: { pos: [number, number]; seq: number } | null }) {
  const map = useMap();
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (target && target.seq !== prev.current) {
      prev.current = target.seq;
      map.flyTo(target.pos, 13, { duration: 1.1 });
    }
  }, [map, target]);
  return null;
}

function HutMarkers({
  huts,
  dntIcon,
  otherIcon,
}: {
  huts: Hut[];
  dntIcon: L.DivIcon;
  otherIcon: L.DivIcon;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [bounds, setBounds] = useState(() => map.getBounds());

  useMapEvents({
    zoomend: (e) => {
      const m = e.target as L.Map;
      setZoom(m.getZoom());
      setBounds(m.getBounds());
    },
    moveend: (e) => setBounds((e.target as L.Map).getBounds()),
  });

  if (zoom < 7 || huts.length === 0) return null;

  const padded = bounds.pad(0.15);
  const visible = huts.filter((h) => padded.contains([h.lat, h.lon]));

  return (
    <>
      {visible.map((h) => (
        <Marker
          key={h.id}
          position={[h.lat, h.lon]}
          icon={h.dnt ? dntIcon : otherIcon}
        >
          <Popup>
            <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 148, color: "var(--bone)" }}>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: ".22em",
                  color: h.dnt ? "var(--ember)" : "var(--moss)",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {h.dnt ? "DNT Hytte" : "Hytte"}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 18,
                  color: "var(--bone)",
                }}
              >
                {h.name}
              </div>
              {h.serviceLevel && (
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    color: "var(--bone-2)",
                  }}
                >
                  {h.serviceLevel}
                </div>
              )}
              {h.beds != null && h.beds > 0 && (
                <div style={{ fontSize: 12, marginTop: 4, color: "var(--bone-2)" }}>
                  {h.beds} senger
                </div>
              )}
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--ember)",
                  textDecoration: "none",
                }}
              >
                UT.no →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

/* ── Main ── */
export default function LeafletMap() {
  const [huts, setHuts] = useState<Hut[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [layer, setLayer] = useState<Layer>("topo");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [flyTo, setFlyTo] = useState<{ pos: [number, number]; seq: number } | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dntIcon] = useState(() => makeCabinIcon(true));
  const [otherIcon] = useState(() => makeCabinIcon(false));

  useEffect(() => {
    fetch("/api/huts")
      .then((r) => r.json())
      .then((d) => {
        setHuts(d.huts ?? []);
        setIsFallback(!!d.fallback);
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      try {
        const url = `https://ws.geonorge.no/stedsnavn/v1/sted?sok=${encodeURIComponent(q)}&fuzzy=true&utkoordsys=4258&side=1&treffPerSide=8`;
        const data = await fetch(url).then((r) => r.json());
        const items: PlaceResult[] = (data?.navn ?? [])
          .map((n: Record<string, unknown>) => ({
            name:
              (n.stedsnavn as Array<Record<string, string>>)?.[0]?.skrivemåte ?? "",
            type: (n.navneobjekttype as string) ?? "",
            lat: (n.representasjonspunkt as Record<string, number>)?.nord,
            lon: (n.representasjonspunkt as Record<string, number>)?.øst,
          }))
          .filter((r: PlaceResult) => r.name && r.lat && r.lon);
        setResults(items);
      } catch {}
    }, 280);
  }, []);

  const selectResult = useCallback((r: PlaceResult) => {
    setFlyTo((prev) => ({ pos: [r.lat, r.lon], seq: (prev?.seq ?? 0) + 1 }));
    setQuery(r.name);
    setResults([]);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* ── Search ── */}
      <div style={{ position: "absolute", top: 12, left: 12, right: 12, zIndex: 800 }}>
        <div
          style={{
            background: "rgba(10,15,28,0.78)",
            backdropFilter: "blur(14px) saturate(140%)",
            WebkitBackdropFilter: "blur(14px) saturate(140%)",
            border: "1px solid rgba(233,227,211,0.12)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            overflow: "hidden",
            color: "var(--bone)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--bone-2)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5l4 4" />
            </svg>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Søk etter sted…"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                letterSpacing: ".02em",
                color: "var(--bone)",
                outline: "none",
              }}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.55,
                  fontSize: 14,
                  lineHeight: 1,
                  color: "var(--bone)",
                }}
              >
                ✕
              </button>
            )}
          </div>
          {results.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(233,227,211,0.10)" }}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectResult(r)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "10px 12px",
                    borderBottom:
                      i < results.length - 1 ? "1px dashed rgba(233,227,211,0.10)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: "italic",
                      fontSize: 16,
                      color: "var(--bone)",
                      flex: 1,
                    }}
                  >
                    {r.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: ".18em",
                      color: "var(--ember)",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Layer toggle ── */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 12,
          zIndex: 800,
          display: "flex",
          gap: 5,
        }}
      >
        {(["topo", "toporaster"] as Layer[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: 999,
              cursor: "pointer",
              border: `1px solid ${layer === l ? "var(--ember)" : "rgba(233,227,211,0.25)"}`,
              background: layer === l ? "var(--ember)" : "rgba(10,15,28,0.78)",
              color: layer === l ? "var(--night)" : "var(--bone)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
              transition: "background .12s, color .12s",
            }}
          >
            {l === "topo" ? "Topo" : "Raster"}
          </button>
        ))}
      </div>

      {/* ── Hut count badge ── */}
      {huts.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 12,
            zIndex: 800,
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            padding: "5px 12px",
            borderRadius: 999,
            border: `1px solid ${isFallback ? "rgba(244,162,89,0.55)" : "rgba(163,196,160,0.45)"}`,
            background: "rgba(10,15,28,0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: isFallback ? "var(--ember)" : "var(--moss)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          {isFallback ? `${huts.length} hytter · SNAPSHOT` : `${huts.length} hytter`}
        </div>
      )}

      {/* ── Fallback data notice ── */}
      {isFallback && (
        <div
          style={{
            position: "absolute",
            top: 64,
            left: 12,
            right: 12,
            zIndex: 800,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: ".14em",
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid rgba(244,162,89,0.35)",
            background: "rgba(10,15,28,0.82)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            color: "var(--ember)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          }}
        >
          HYTTEDATA KAN VÆRE UTDATERT — OFFLINE SNAPSHOT BRUKES (DNT-API UTILGJENGELIG)
        </div>
      )}

      {/* ── Map ── */}
      <MapContainer
        center={[61.2, 12.0]}
        zoom={9}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          key={layer}
          url={TILE[layer]}
          attribution='&copy; <a href="https://www.kartverket.no">Kartverket</a>'
        />
        <HutMarkers huts={huts} dntIcon={dntIcon} otherIcon={otherIcon} />
        <FlyTo target={flyTo} />
      </MapContainer>
    </div>
  );
}
