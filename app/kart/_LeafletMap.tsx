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
  const stroke = dnt ? "#b85a3c" : "#5b6b5a";
  return L.divIcon({
    html: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 11l9-7 9 7v9H3z" fill="#fff8ea"/>
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
            <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: 148 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: ".14em",
                  color: h.dnt ? "#b85a3c" : "#5b6b5a",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {h.dnt ? "DNT Hytte" : "Hytte"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{h.name}</div>
              {h.serviceLevel && (
                <div
                  style={{
                    marginTop: 3,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "#5b6b5a",
                  }}
                >
                  {h.serviceLevel}
                </div>
              )}
              {h.beds != null && h.beds > 0 && (
                <div style={{ fontSize: 12, marginTop: 4, color: "#2a2520" }}>
                  {h.beds} senger
                </div>
              )}
              <a
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "#d97757",
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
      .then((d) => setHuts(d.huts ?? []))
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
            background: "rgba(255,248,234,0.94)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(26,31,26,.2)",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(26,31,26,.18)",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5b6b5a"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5l4 4" />
            </svg>
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Søk etter sted…"
              style={{
                flex: 1, border: "none", background: "transparent",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
                letterSpacing: ".06em", color: "#2a2520", outline: "none",
              }}
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setResults([]); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, opacity: 0.45, fontSize: 14, lineHeight: 1, color: "#2a2520",
                }}
              >
                ✕
              </button>
            )}
          </div>
          {results.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(26,31,26,.1)" }}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectResult(r)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, width: "100%",
                    background: "none", border: "none", padding: "8px 10px",
                    borderBottom: i < results.length - 1 ? "1px dashed rgba(26,31,26,.1)" : "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#2a2520", flex: 1 }}>
                    {r.name}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: ".12em", color: "#5b6b5a", textTransform: "uppercase", flexShrink: 0 }}>
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Layer toggle ── */}
      <div style={{ position: "absolute", bottom: 28, right: 12, zIndex: 800, display: "flex", gap: 5 }}>
        {(["topo", "toporaster"] as Layer[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
              letterSpacing: ".12em", textTransform: "uppercase",
              padding: "4px 9px", borderRadius: 99, cursor: "pointer",
              border: "1px solid rgba(26,31,26,.32)",
              background: layer === l ? "rgba(26,31,26,.88)" : "rgba(255,248,234,0.9)",
              color: layer === l ? "#ede4d3" : "#2a2520",
              backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
              boxShadow: "0 1px 4px rgba(26,31,26,.15)",
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
            position: "absolute", bottom: 28, left: 12, zIndex: 800,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: ".12em", textTransform: "uppercase",
            padding: "4px 9px", borderRadius: 99,
            border: "1px solid rgba(91,107,90,.45)",
            background: "rgba(255,248,234,0.9)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            color: "#5b6b5a", boxShadow: "0 1px 4px rgba(26,31,26,.15)",
          }}
        >
          {huts.length} hytter
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
