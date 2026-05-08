/* Tiny pictograms — abstracted, woodcut-flavoured. */

export function Glyph({ name, size = 20, color = 'currentColor' }) {
  const s = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const W = size, H = size;
  switch (name) {
    case 'cabin':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/></g></svg>);
    case 'compass':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-4 1 2-6 4-1z" fill={color} fillOpacity=".15"/></g></svg>);
    case 'map':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></g></svg>);
    case 'pack':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M7 8V6a3 3 0 016 0v2"/><rect x="4" y="8" width="12" height="13" rx="2"/><path d="M4 13h12M16 11l4 1v8l-4-1"/></g></svg>);
    case 'home':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M3 11l9-7 9 7v9H3z"/></g></svg>);
    case 'journal':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2V4z"/><path d="M5 18h14"/></g></svg>);
    case 'arrow-r':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M5 12h14M13 6l6 6-6 6"/></g></svg>);
    case 'sos':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><circle cx="12" cy="12" r="9"/><path d="M12 7v5M12 16v.01"/></g></svg>);
    case 'pin':
      return (<svg width={W} height={H} viewBox="0 0 24 24"><g {...s}><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.2"/></g></svg>);
    default: return null;
  }
}

export function WeatherGlyph({ kind = 'cloud-sun', size = 18, color = 'currentColor' }) {
  const s = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'cloud-sun') return (<svg width={size} height={size} viewBox="0 0 24 24"><g {...s}><circle cx="8" cy="9" r="3"/><path d="M8 3v1M3 9h1M5.5 5.5l.7.7M11.5 5.5l-.7.7"/><path d="M9 16h8a3 3 0 100-6 4 4 0 00-7.7 1"/></g></svg>);
  if (kind === 'rain')      return (<svg width={size} height={size} viewBox="0 0 24 24"><g {...s}><path d="M7 14h10a3 3 0 100-6 4 4 0 00-7.7 1A3 3 0 007 14z"/><path d="M9 18l-1 2M13 18l-1 2M17 18l-1 2"/></g></svg>);
  if (kind === 'sun')       return (<svg width={size} height={size} viewBox="0 0 24 24"><g {...s}><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></g></svg>);
  return null;
}
