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
  { href: "/", label: "Hjem", icon: "home", match: (p) => p === "/" },
  { href: "/tur", label: "Tur", icon: "map", match: (p) => p.startsWith("/tur") || p === "/live" },
  { href: "/pakk", label: "Pakk", icon: "pack", match: (p) => p.startsWith("/pakk") },
  { href: "/dagbok", label: "Dagbok", icon: "journal", match: (p) => p.startsWith("/dagbok") },
];

export default function TabBar() {
  const path = usePathname() || "/";
  return (
    <nav className="tabbar" aria-label="Hovednavigasjon">
      {items.map(({ href, label, icon, match }) => (
        <Link key={href} href={href} className={match(path) ? "active" : ""}>
          <Glyph name={icon} size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
