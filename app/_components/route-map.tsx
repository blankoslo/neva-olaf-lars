"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILE_URL =
  "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png";
const TILE_ATTR = '&copy; <a href="https://kartverket.no">Kartverket</a>';

/* Palette for multiple route legs */
const LEG_COLORS = ["#d97757", "#5b6b5a", "#c8870a"];

export default function RouteMap({ geometries }: { geometries: GeoJSON.LineString[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw geometries and fit bounds whenever they change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    if (geometries.length === 0) return;

    const allLatLngs: L.LatLngExpression[] = [];

    geometries.forEach((geom, idx) => {
      const color = LEG_COLORS[idx % LEG_COLORS.length];
      const latlngs: L.LatLngExpression[] = geom.coordinates.map(
        ([lng, lat]) => [lat, lng] as [number, number],
      );

      // Shadow for contrast
      L.polyline(latlngs, {
        color: "#fff", weight: 5, opacity: 0.6, lineJoin: "round", lineCap: "round",
      }).addTo(map);

      L.polyline(latlngs, {
        color, weight: 3, opacity: 0.95, lineJoin: "round", lineCap: "round",
      }).addTo(map);

      // Start / end markers
      if (latlngs.length > 0) {
        const startIcon = L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          className: "", iconSize: [10, 10], iconAnchor: [5, 5],
        });
        const endIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
          className: "", iconSize: [12, 12], iconAnchor: [6, 6],
        });
        L.marker(latlngs[0] as L.LatLngExpression, { icon: startIcon }).addTo(map);
        L.marker(latlngs[latlngs.length - 1] as L.LatLngExpression, { icon: endIcon }).addTo(map);
      }

      allLatLngs.push(...latlngs);
    });

    if (allLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [20, 20], maxZoom: 14 });
    }
  }, [geometries]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
