"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const RouteMap = dynamic(() => import("../../_components/route-map"), {
  ssr: false,
  loading: () => (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--night-3)" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".18em" }}>LASTER KART…</span>
    </div>
  ),
});

type RouteDetail = { id: number; geometry: GeoJSON.LineString | null };

export default function InviteMap({ routeIds }: { routeIds: number[] }) {
  const [geometries, setGeometries] = useState<GeoJSON.LineString[]>([]);

  useEffect(() => {
    if (routeIds.length === 0) return;
    Promise.all(
      routeIds.map((id) =>
        fetch(`/api/routes/${id}`).then((r) => r.json() as Promise<RouteDetail>),
      ),
    )
      .then((data) => {
        setGeometries(data.map((d) => d.geometry).filter(Boolean) as GeoJSON.LineString[]);
      })
      .catch(() => {});
  }, [routeIds]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <RouteMap geometries={geometries} />
    </div>
  );
}
