import { notFound } from "next/navigation";
import Link from "next/link";
import TabBar from "../../../_components/tabbar";
import prisma from "../../../../lib/prisma";

type RouteSuggestion = {
  title: string;
  routes: { duration: { hours: number | null; days: number | null; minutes: number | null } | null }[];
};

const BASE_ITEMS: { cat: string; list: string[] }[] = [
  { cat: "På kroppen", list: ["Ullundertøy", "Skalljakke", "Skallbukse", "Lue", "Hansker", "Solbriller"] },
  { cat: "I sekken", list: ["Sovepose", "Liggeunderlag", "Skift av klær", "Førstehjelp", "Hodelykt + ekstra batteri", "Regnponcho"] },
  { cat: "Mat & drikke", list: ["Primus + brensel", "Termos", "Tørrmat", "Sjokolade", "Vannflaske 1 l"] },
  { cat: "Navigasjon", list: ["Kart 1:50 000", "Kompass", "Telefon + powerbank"] },
];

export default async function TripPakkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({ where: { id }, select: { title: true, selectedSuggestion: true, planningFields: true } });
  if (!trip) notFound();

  const selected = (trip.selectedSuggestion ?? null) as RouteSuggestion | null;
  const fields = (trip.planningFields ?? {}) as Record<string, string | number | null | undefined>;

  const days = typeof fields.days === "number" ? fields.days :
    selected?.routes.reduce((sum, r) => sum + (r.duration?.days ?? (r.duration?.hours ? 1 : 0)), 0) ?? 0;

  // Add extra items for multi-day trips
  const items = BASE_ITEMS.map((group) => {
    if (group.cat === "I sekken" && days > 1) {
      return { ...group, list: [...group.list, `${days - 1} ekstra skift`, "Vaskeklut"] };
    }
    if (group.cat === "Mat & drikke" && days > 0) {
      return { ...group, list: group.list.map((i) => i === "Tørrmat" ? `Tørrmat ${days} dag${days > 1 ? "er" : ""}` : i) };
    }
    return group;
  });

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <Link href={`/tur/${id}`} className="pill" style={{ textDecoration: "none" }}>
            ← TILBAKE
          </Link>
          <h1
            style={{
              marginTop: 18,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Pakkeliste
            {selected && (
              <>
                <br />
                <em style={{ fontSize: 26 }}>{selected.title}</em>
              </>
            )}
          </h1>
          {fields.region && (
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}>
              {String(fields.region).toUpperCase()}
              {days ? ` · ${days} DAG${Number(days) > 1 ? "ER" : ""}` : ""}
            </div>
          )}
        </div>

        {selected ? (
          items.map((g) => (
            <section key={g.cat} className="page-pad">
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
                ─── {g.cat.toUpperCase()}
              </div>
              <ul className="split-list">
                {g.list.map((it) => (
                  <li
                    key={it}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: "1px dashed rgba(233,227,211,0.10)",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        border: "1.5px solid rgba(233,227,211,.2)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 15, color: "var(--bone)" }}>{it}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        ) : (
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", padding: "24px 0", letterSpacing: ".14em" }}
            >
              INGEN TUR VALGT ENNÅ
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}

