import Link from "next/link";
import TabBar from "../_components/tabbar";

const ITEMS: { cat: string; list: string[] }[] = [
  { cat: "På kroppen", list: ["Ullundertøy", "Skalljakke", "Skallbukse", "Lue", "Hansker"] },
  {
    cat: "I sekken",
    list: ["Sovepose -5°", "Liggeunderlag", "Skift av klær", "Førstehjelp", "Hodelykt + ekstra batteri"],
  },
  {
    cat: "Mat & drikke",
    list: ["Primus + brensel", "Termos", "Tørrmat 3 dager", "Sjokolade", "Vannflaske 1 l"],
  },
  {
    cat: "Navigasjon",
    list: ["Kart 1:50 000", "Kompass", "Telefon + powerbank", "Visittkort til hytta"],
  },
];

export default function PackPage() {
  const done = new Set<string>([
    "Ullundertøy",
    "Skalljakke",
    "Lue",
    "Sovepose -5°",
    "Hodelykt + ekstra batteri",
    "Primus + brensel",
    "Termos",
    "Tørrmat 3 dager",
    "Kart 1:50 000",
    "Kompass",
    "Telefon + powerbank",
    "Visittkort til hytta",
    "Hansker",
    "Liggeunderlag",
  ]);

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <Link href="/" className="pill" style={{ textDecoration: "none" }}>
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
            <br />
            <em>Wilhelms runde.</em>
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            14 / 22 · OPPDATERT 06·09
          </div>
        </div>

        {ITEMS.map((g) => (
          <section key={g.cat} className="page-pad">
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
              ─── {g.cat.toUpperCase()}
            </div>
            <ul className="split-list">
              {g.list.map((it) => {
                const checked = done.has(it);
                return (
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
                        border: "1.5px solid #2a2520",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: checked ? "var(--moss)" : "transparent",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        opacity: checked ? 0.55 : 1,
                        textDecoration: checked ? "line-through" : "none",
                      }}
                    >
                      {it}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <div style={{ height: 24 }} />
      </main>
      <TabBar />
    </>
  );
}
