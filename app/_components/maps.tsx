/* Maps & ambient cartography — night-blue field, ember route. */

type RouteTheme = "paper" | "cream";

/**
 * Mountains — three-layer parallax silhouette used as ambient backdrop
 * behind hero / chat screens. Renders fluid by default.
 */
export function Mountains({
  opacity = 1,
  withSky = true,
}: {
  opacity?: number;
  withSky?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 390 844"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="wt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070b17" />
          <stop offset="45%" stopColor="#0e1426" />
          <stop offset="75%" stopColor="#1a2138" />
          <stop offset="92%" stopColor="#3a2c1c" />
          <stop offset="100%" stopColor="#7a4a1f" />
        </linearGradient>
        <radialGradient id="wt-ember" cx="0.5" cy="0.95" r="0.6">
          <stop offset="0%" stopColor="#f4a259" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#f4a259" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#f4a259" stopOpacity="0" />
        </radialGradient>
      </defs>
      {withSky && <rect x="0" y="0" width="390" height="844" fill="url(#wt-sky)" />}
      {withSky && <rect x="0" y="0" width="390" height="844" fill="url(#wt-ember)" />}
      {/* fjernaste rygg */}
      <polygon
        points="0,560 40,500 90,540 150,470 210,520 270,460 330,510 390,475 390,844 0,844"
        fill="#1c2540"
        opacity="0.7"
      />
      {/* midt-lag */}
      <polygon
        points="0,640 50,580 110,620 170,560 230,610 290,555 360,605 390,580 390,844 0,844"
        fill="#121a30"
        opacity="0.85"
      />
      {/* nær framgrunn */}
      <polygon
        points="0,720 60,680 130,710 200,650 280,705 360,665 390,690 390,844 0,844"
        fill="#080c18"
      />
      {withSky &&
        Array.from({ length: 40 }).map((_, i) => (
          <circle
            key={i}
            cx={(i * 47) % 390}
            cy={((i * 31) % 380) + 40}
            r={0.6 + (i % 3) * 0.3}
            fill="#e9e3d3"
            opacity={0.3 + (i % 5) * 0.1}
          />
        ))}
    </svg>
  );
}

/**
 * RouteMap — topographic concentric ovals + dashed ember route. Fluid by
 * default. The `theme` prop is preserved for source compatibility but the
 * night-theme palette is now used for both values.
 */
export function RouteMap({
  width,
  height,
  theme = "paper",
}: {
  width?: number;
  height?: number;
  theme?: RouteTheme;
}) {
  const fluid = width === undefined && height === undefined;
  void theme;
  return (
    <svg
      viewBox="0 0 350 220"
      width={fluid ? undefined : width}
      height={fluid ? undefined : height}
      style={fluid ? { display: "block", width: "100%", height: "auto" } : { display: "block" }}
    >
      <rect x="0" y="0" width="350" height="220" fill="#0e1426" />
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse
          key={i}
          cx={175}
          cy={110}
          rx={30 + i * 22}
          ry={14 + i * 11}
          fill="none"
          stroke="#cfc6b1"
          strokeWidth="0.3"
          opacity={0.18}
        />
      ))}
      <path
        d="M 30,180 Q 80,150 110,130 Q 150,105 200,100 Q 260,95 310,55"
        fill="none"
        stroke="#f4a259"
        strokeWidth="2.2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      {(
        [
          [30, 180],
          [110, 130],
          [200, 100],
          [310, 55],
        ] as const
      ).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="#0a0f1c" stroke="#f4a259" strokeWidth="1.6" />
          <circle cx={x} cy={y} r="2.2" fill="#f4a259" />
        </g>
      ))}
      <text
        x="14"
        y="14"
        fontFamily="DM Mono, monospace"
        fontSize="9"
        fill="#8a93a8"
        letterSpacing="2"
      >
        N · 350 KM²
      </text>
    </svg>
  );
}

/**
 * Elevation — soft ember-tinted profile against night.
 */
export function Elevation({ width, height }: { width?: number; height?: number }) {
  const path =
    "M 0 60 L 20 55 L 45 40 L 70 30 L 100 38 L 130 22 L 170 14 L 210 22 L 250 36 L 285 30 L 320 50";
  const fluid = width === undefined && height === undefined;
  return (
    <svg
      viewBox="0 0 320 70"
      width={fluid ? undefined : width}
      height={fluid ? undefined : height}
      style={fluid ? { display: "block", width: "100%", height: "auto" } : { display: "block" }}
    >
      <path d={path + " L 320 70 L 0 70 Z"} fill="rgba(244,162,89,0.18)" />
      <path d={path} fill="none" stroke="#f4a259" strokeWidth="1.6" strokeLinecap="round" />
      <g stroke="#cfc6b1" strokeWidth="0.4" opacity="0.18">
        <line x1="0" y1="20" x2="320" y2="20" />
        <line x1="0" y1="45" x2="320" y2="45" />
      </g>
    </svg>
  );
}

/**
 * ContourMap — concentric topo ovals. Fluid in both axes by default so it
 * fills any container (used inside small thumbnails on the home page).
 */
export function ContourMap({
  width,
  height,
  stroke = "#cfc6b1",
  opacity = 0.22,
}: {
  width?: number;
  height?: number;
  stroke?: string;
  opacity?: number;
}) {
  const fluid = width === undefined && height === undefined;
  return (
    <svg
      viewBox="0 0 320 200"
      width={fluid ? undefined : width}
      height={fluid ? undefined : height}
      style={
        fluid
          ? { display: "block", width: "100%", height: "100%" }
          : { display: "block" }
      }
      preserveAspectRatio="none"
    >
      <rect x="0" y="0" width="320" height="200" fill="#0e1426" />
      <g fill="none" stroke={stroke} strokeWidth="0.5" opacity={opacity}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse
            key={i}
            cx={160}
            cy={100}
            rx={20 + i * 24}
            ry={10 + i * 12}
          />
        ))}
      </g>
    </svg>
  );
}
