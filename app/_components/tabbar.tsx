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

const baseItems: Item[] = [
  { href: "/", label: "Hjem", icon: "home", match: (p) => p === "/" },
  { href: "/tur", label: "Tur", icon: "map", match: (p) => p.startsWith("/tur") || p === "/live" },
  { href: "/kart", label: "Kart", icon: "compass", match: (p) => p.startsWith("/kart") },
  { href: "/pakk", label: "Pakk", icon: "pack", match: (p) => p.startsWith("/pakk") },
  { href: "/dagbok", label: "Dagbok", icon: "journal", match: (p) => p.startsWith("/dagbok") },
];

const tripExtraItem: Item = {
  href: "/deltakere",
  label: "Følge",
  icon: "people",
  match: (p) => p.includes("/deltakere"),
};

const tripCommentsItem: Item = {
  href: "/snakk",
  label: "Snakk",
  icon: "chat",
  match: (p) => p.includes("/snakk"),
};

const tripExpensesItem: Item = {
  href: "/utgifter",
  label: "Utgifter",
  icon: "receipt",
  match: (p) => p.includes("/utgifter"),
};

const tripAlbumItem: Item = {
  href: "/album",
  label: "Album",
  icon: "camera",
  match: (p) => p.includes("/album"),
};

function getTripId(path: string): string | null {
  const m = path.match(/^\/tur\/([^/]+)/);
  return m ? m[1] : null;
}

export default function TabBar() {
  const path = usePathname() || "/";
  const tripId = getTripId(path);

  const items: Item[] = tripId
    ? [
        ...baseItems.map((item) => {
          if (item.href === "/") return item;
          if (item.href === "/tur")
            return {
              ...item,
              href: `/tur/${tripId}`,
              match: (p: string) => p === `/tur/${tripId}`,
            };
          if (item.href === "/kart")
            return {
              ...item,
              href: `/tur/${tripId}/kart`,
              match: (p: string) => p.startsWith(`/tur/${tripId}/kart`),
            };
          if (item.href === "/pakk")
            return {
              ...item,
              href: `/tur/${tripId}/pakk`,
              match: (p: string) => p.startsWith(`/tur/${tripId}/pakk`),
            };
          if (item.href === "/dagbok")
            return {
              ...item,
              href: `/tur/${tripId}/dagbok`,
              match: (p: string) => p.startsWith(`/tur/${tripId}/dagbok`),
            };
          return item;
        }),
        {
          ...tripExtraItem,
          href: `/tur/${tripId}/deltakere`,
          match: (p: string) => p.startsWith(`/tur/${tripId}/deltakere`),
        },
        {
          ...tripCommentsItem,
          href: `/tur/${tripId}/snakk`,
          match: (p: string) => p.startsWith(`/tur/${tripId}/snakk`),
        },
        {
          ...tripExpensesItem,
          href: `/tur/${tripId}/utgifter`,
          match: (p: string) => p.startsWith(`/tur/${tripId}/utgifter`),
        },
        {
          ...tripAlbumItem,
          href: `/tur/${tripId}/album`,
          match: (p: string) => p.startsWith(`/tur/${tripId}/album`),
        },
      ]
    : baseItems;

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
