"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const RouteMap = dynamic(() => import("../../../_components/route-map"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, background: "var(--night-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".18em" }}>LASTER KART…</span>
    </div>
  ),
});

type RouteDetail = {
  id: number;
  geometry: GeoJSON.LineString | null;
};

export function TripKartClient({ routeIds }: { routeIds: number[] }) {
  const mainRef = useRef<HTMLElement>(null);
  const [geometries, setGeometries] = useState<GeoJSON.LineString[]>([]);

  useEffect(() => {
    if (routeIds.length === 0) return;
    Promise.all(
      routeIds.map((id) =>
        fetch(`/api/routes/${id}`).then((r) => r.json() as Promise<RouteDetail>),
      ),
    ).then((data) => {
      setGeometries(data.map((d) => d.geometry).filter(Boolean) as GeoJSON.LineString[]);
    }).catch(() => {});
  }, [routeIds]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".topstrip");
    const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 40;
    if (mainRef.current) {
      mainRef.current.style.height = `calc(100dvh - ${headerH}px - 60px)`;
    }
    const shell = document.querySelector<HTMLElement>(".shell");
    const prevPad = shell?.style.paddingBottom ?? "";
    if (shell) shell.style.paddingBottom = "0";
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (shell) shell.style.paddingBottom = prevPad;
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <main ref={mainRef} style={{ height: "calc(100dvh - 100px)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {routeIds.length === 0 ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--slate)", letterSpacing: ".14em" }}>
            INGEN TUR VALGT ENNÅ
          </span>
        </div>
      ) : (
        <RouteMap geometries={geometries} />
      )}
    </main>
  );
}
