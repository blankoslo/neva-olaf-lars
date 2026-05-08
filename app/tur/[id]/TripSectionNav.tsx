"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Section = {
  slug: string;
  label: string;
};

const sections: Section[] = [
  { slug: "", label: "Oversikt" },
  { slug: "kart", label: "Kart" },
  { slug: "pakk", label: "Pakk" },
  { slug: "dagbok", label: "Dagbok" },
  { slug: "deltakere", label: "Følge" },
  { slug: "snakk", label: "Snakk" },
  { slug: "utgifter", label: "Utgifter" },
  { slug: "album", label: "Album" },
  { slug: "anmeldelse", label: "Anmeld" },
];

export default function TripSectionNav({ tripId }: { tripId: string }) {
  const path = usePathname() || "";
  const base = `/tur/${tripId}`;

  return (
    <nav
      aria-label="Tur-seksjoner"
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "10px 18px 4px",
        borderBottom: "1px solid rgba(233,227,211,0.06)",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {sections.map(({ slug, label }) => {
        const href = slug ? `${base}/${slug}` : base;
        const active = slug ? path.startsWith(href) : path === base;
        return (
          <Link
            key={slug || "overview"}
            href={href}
            className="mono"
            style={{
              flex: "0 0 auto",
              fontSize: 10,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              padding: "6px 10px",
              borderRadius: 999,
              border: `1px solid ${active ? "var(--ember)" : "rgba(233,227,211,0.18)"}`,
              color: active ? "var(--ember)" : "var(--bone-2)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
