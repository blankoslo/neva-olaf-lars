"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Glyph, type GlyphName } from "./glyph";

type Item = {
  href: string;
  label: string;
  icon: GlyphName;
  match: (p: string) => boolean;
};

const items: Item[] = [
  { href: "/", label: "Wilhelm", icon: "home", match: (p) => p === "/" },
  {
    href: "/turer",
    label: "Turer",
    icon: "map",
    match: (p) =>
      p.startsWith("/turer") ||
      p.startsWith("/tur") ||
      p.startsWith("/historikk") ||
      p.startsWith("/statistikk"),
  },
  { href: "/profil", label: "Profil", icon: "people", match: (p) => p.startsWith("/profil") },
];

export default function TabBar() {
  const path = usePathname() || "/";

  return (
    <nav className="tabbar" style={{ "--tab-count": items.length } as React.CSSProperties} aria-label="Hovednavigasjon">
      {items.map(({ href, label, icon, match }) => (
        <Link key={href} href={href} className={match(path) ? "active" : ""}>
          <Glyph name={icon} size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
