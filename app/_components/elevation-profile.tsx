"use client";

type Stage = {
  dayNumber: number;
  fromLocation: string;
  toLocation: string;
  distanceKm: number | null;
  elevationGainM: number | null;
  elevationLossM: number | null;
};

type Point = { x: number; y: number; label: string; km: number; elev: number };

function buildProfilePoints(stages: Stage[], width: number, height: number): Point[] {
  if (stages.length === 0) return [];

  // Build cumulative km + elevation data
  const sorted = [...stages].sort((a, b) => a.dayNumber - b.dayNumber);
  const points: Point[] = [];
  let cumKm = 0;
  let cumElev = 0;

  points.push({ x: 0, y: height, label: sorted[0].fromLocation, km: 0, elev: 0 });

  for (const stage of sorted) {
    const km = stage.distanceKm ?? 0;
    const gain = stage.elevationGainM ?? 0;
    const loss = stage.elevationLossM ?? 0;
    cumKm += km;
    cumElev += gain - loss;
    points.push({
      x: 0, // calculated below
      y: 0, // calculated below
      label: stage.toLocation,
      km: cumKm,
      elev: cumElev,
    });
  }

  const maxKm = points[points.length - 1].km;
  const elevVals = points.map((p) => p.elev);
  const minElev = Math.min(...elevVals);
  const maxElev = Math.max(...elevVals);
  const elevRange = maxElev - minElev || 1;

  const padding = { top: 10, bottom: 10, left: 4, right: 4 };
  const usableW = width - padding.left - padding.right;
  const usableH = height - padding.top - padding.bottom;

  return points.map((p) => ({
    ...p,
    x: padding.left + (maxKm > 0 ? (p.km / maxKm) * usableW : 0),
    y: padding.top + usableH - ((p.elev - minElev) / elevRange) * usableH,
  }));
}

export function ElevationProfile({
  stages,
  color = "var(--ember)",
  width = 340,
  height = 100,
}: {
  stages: Stage[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const pts = buildProfilePoints(stages, width, height);
  if (pts.length < 2) {
    return (
      <div
        className="mono"
        style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".14em", textAlign: "center", padding: "20px 0" }}
      >
        INGEN HØYDEDATA
      </div>
    );
  }

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `M ${pts[0].x},${height} ` +
    pts.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${pts[pts.length - 1].x},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="Høydeprofil"
    >
      {/* Area fill */}
      <path d={area} fill={color} fillOpacity={0.12} />
      {/* Profile line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
      {/* Stage markers */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill={color} opacity={0.85} />
          {i === 0 || i === pts.length - 1 ? (
            <text
              x={p.x}
              y={height - 2}
              textAnchor={i === 0 ? "start" : "end"}
              fontSize={7}
              fill="var(--slate)"
              fontFamily="'DM Mono', monospace"
            >
              {p.label.substring(0, 12)}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
