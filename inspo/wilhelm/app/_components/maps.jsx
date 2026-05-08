/* RouteMap, Elevation, ContourMap — abstract field-journal cartography. */

export function RouteMap({ width = 320, height = 180, theme = 'paper' }) {
  const T = {
    paper: { bg: '#e8dfc8', land: '#d6c9a3', water: '#a8c0b8', line: '#1a1f1a', accent: '#d97757' },
    cream: { bg: '#fff8ea', land: '#efe4ca', water: '#cfdcd4', line: '#1a1f1a', accent: '#d97757' },
  }[theme];
  return (
    <svg viewBox="0 0 320 180" width={width} height={height} style={{ display: 'block' }}>
      <rect width="320" height="180" fill={T.bg}/>
      <path d="M 20 30 Q 80 10 150 30 T 300 40 L 310 90 Q 220 80 180 100 Q 120 120 60 100 Q 30 90 20 60 Z" fill={T.land} opacity="0.7"/>
      <path d="M 30 130 Q 120 110 200 130 T 320 140 L 320 180 L 0 180 L 0 140 Q 15 135 30 130 Z" fill={T.land} opacity="0.6"/>
      <path d="M 120 60 Q 160 50 200 65 Q 220 80 200 95 Q 160 105 130 95 Q 105 80 120 60 Z" fill={T.water}/>
      <g fill="none" stroke={T.line} strokeWidth="0.5" opacity="0.25">
        <path d="M 40 50 Q 100 35 170 55 T 290 60"/>
        <path d="M 30 90 Q 100 75 170 95 T 295 95"/>
        <path d="M 20 120 Q 90 110 170 125 T 300 130"/>
      </g>
      <path d="M 40 150 Q 70 130 95 120 Q 130 105 145 80 Q 160 55 200 50 Q 235 48 255 70 Q 270 90 280 130"
            fill="none" stroke={T.accent} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="5 4"/>
      {[[40,150], [145,80], [255,70], [280,130]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill={T.bg} stroke={T.line} strokeWidth="1.5"/>
          <circle cx={x} cy={y} r="2.5" fill={T.accent}/>
        </g>
      ))}
      <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill={T.line} letterSpacing="1">
        <text x="48" y="146">RØVOLLEN</text>
        <text x="153" y="76">LINNESET</text>
        <text x="220" y="64">ROENS.</text>
        <text x="248" y="148">RØVOLLEN</text>
      </g>
      <g transform="translate(290,28)">
        <circle r="11" fill="none" stroke={T.line} strokeWidth="0.8"/>
        <path d="M 0 -8 L 2.5 0 L 0 8 L -2.5 0 Z" fill={T.accent}/>
        <text x="0" y="-13" fontFamily="JetBrains Mono,monospace" fontSize="6" textAnchor="middle" fill={T.line}>N</text>
      </g>
    </svg>
  );
}

export function Elevation({ width = 320, height = 70 }) {
  const path = "M 0 60 L 20 55 L 45 40 L 70 30 L 100 38 L 130 22 L 170 14 L 210 22 L 250 36 L 285 30 L 320 50";
  return (
    <svg viewBox="0 0 320 70" width={width} height={height} style={{ display: 'block', width: '100%' }}>
      <path d={path + ' L 320 70 L 0 70 Z'} fill="rgba(217,119,87,0.18)"/>
      <path d={path} fill="none" stroke="#1a1f1a" strokeWidth="1.4"/>
      <g stroke="#1a1f1a" strokeWidth="0.4" opacity=".25">
        <line x1="0" y1="20" x2="320" y2="20"/>
        <line x1="0" y1="45" x2="320" y2="45"/>
      </g>
    </svg>
  );
}

export function ContourMap({ width = 320, height = 200, stroke = '#1a1f1a', opacity = 0.5 }) {
  return (
    <svg viewBox="0 0 320 200" width={width} height={height} style={{ display: 'block' }} preserveAspectRatio="none">
      <g fill="none" stroke={stroke} strokeWidth="0.8" opacity={opacity}>
        <path d="M -10 150 Q 60 120 130 140 T 270 130 T 340 145"/>
        <path d="M -10 165 Q 60 140 130 158 T 270 150 T 340 162"/>
        <path d="M 50 110 Q 90 75 130 110 Q 110 130 90 130 Q 70 130 50 110 Z"/>
        <path d="M 60 108 Q 90 85 120 108 Q 100 122 90 122 Q 80 122 60 108 Z"/>
        <path d="M 70 105 Q 90 92 110 105 Q 100 115 90 115 Q 80 115 70 105 Z"/>
        <path d="M 180 100 Q 230 50 280 100 Q 260 130 230 130 Q 200 130 180 100 Z"/>
        <path d="M 190 98 Q 230 60 270 98 Q 250 120 230 120 Q 210 120 190 98 Z"/>
        <path d="M 200 95 Q 230 70 260 95 Q 245 110 230 110 Q 215 110 200 95 Z"/>
        <path d="M 130 130 Q 160 145 180 100"/>
      </g>
    </svg>
  );
}
