import Link from "next/link";
import { WilhelmAvatar, Stamp } from "../_components/wilhelm";
import { RouteMap } from "../_components/maps";
import { WeatherGlyph, type WeatherKind } from "../_components/glyph";
import TabBar from "../_components/tabbar";

const TRIP = { region: "FINNSKOGEN · SOLØR", days: 3, km: 38 };

const DAYS: {
  id: string;
  d: string;
  date: string;
  from: string;
  to: string;
  km: number;
  h: string;
  w: WeatherKind;
  t: string;
}[] = [
  { id: "dag-1", d: "I", date: "Lør 12. sept", from: "Røvollen", to: "Linneset", km: 11, h: "4 t 30", w: "cloud-sun", t: "12°" },
  { id: "dag-2", d: "II", date: "Søn 13. sept", from: "Linneset", to: "Roenshaugen", km: 14, h: "5 t 15", w: "rain", t: "9°" },
  { id: "dag-3", d: "III", date: "Man 14. sept", from: "Roenshaugen", to: "Røvollen", km: 13, h: "4 t 50", w: "sun", t: "14°" },
];

export default function TripPage() {
  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href="/" className="pill" style={{ textDecoration: "none" }}>
              ← TILBAKE
            </Link>
            <Stamp color="var(--ember)" rotate={-3}>· Om 3 dager ·</Stamp>
          </div>
          <h1
            style={{
              fontSize: 34,
              lineHeight: 1,
              marginTop: 18,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Wilhelms<br />
            <em>runde.</em>
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            {TRIP.region} · {TRIP.km} KM · {TRIP.days} DAGER
          </div>
        </div>

        <div className="map-wrap">
          <RouteMap theme="paper" />
          <div style={{ position: "absolute", top: 8, left: 10 }}>
            <Stamp color="var(--moss)" rotate={-4}>rute · godkjent</Stamp>
          </div>
        </div>

        <div className="page-pad" style={{ paddingBottom: 6 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
            ─── REISERUTE
          </div>
        </div>
        <div className="gutter">
          {DAYS.map((d, i) => (
            <Link
              key={d.id}
              href={`/tur/${d.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "34px 1fr auto",
                gap: 10,
                padding: "12px 0",
                borderBottom: i < DAYS.length - 1 ? "1px dashed rgba(233,227,211,0.10)" : "none",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontSize: 34, lineHeight: 1, fontStyle: "italic", color: "var(--ember)" }}>
                {d.d}
              </div>
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", opacity: 0.55 }}>
                  {d.date}
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.15, marginTop: 2 }}>
                  {d.from} → {d.to}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 10, letterSpacing: ".1em", opacity: 0.65, marginTop: 4 }}
                >
                  {d.km} KM · {d.h}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 2,
                }}
              >
                <WeatherGlyph kind={d.w} size={20} />
                <span className="mono" style={{ fontSize: 11 }}>
                  {d.t}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <section
          className="mx-frame"
          style={{
            marginTop: 18,
            marginBottom: 18,
            padding: "14px 16px",
            background: "rgba(244,162,89,0.06)",
            border: "1px solid rgba(244,162,89,0.30)",
            borderRadius: 4,
            position: "relative",
          }}
        >
          <div className="flex-row gap-3 center">
            <WilhelmAvatar size={40} variant="ember" />
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--ember)" }}>
              WILHELM · NOTAT DAG 2
            </div>
          </div>
          <p
            className="serif italic"
            style={{ marginTop: 8, fontSize: 19, color: "var(--bone-2)", lineHeight: 1.15, marginBottom: 0 }}
          >
            Dag to er den lange. Gå fra Linneset før soloppgang — myra er fastere i kulda.
          </p>
        </section>

        <div className="gutter" style={{ paddingBottom: 14 }}>
          <div className="flex-row between center">
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
              ─── PAKKING
            </div>
            <span className="mono" style={{ fontSize: 11 }}>
              14 / 22
            </span>
          </div>
          <div
            style={{
              height: 6,
              background: "rgba(233,227,211,0.10)",
              borderRadius: 99,
              marginTop: 8,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "63%", height: "100%", background: "var(--ember)" }} />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {["STØVLER ✓", "ULLUNDERTØY ✓", "HODELYKT ✓", "KART ✓", "PRIMUS", "FYRSTIKKER", "FØRSTEHJELP"].map((p) => {
              const done = p.includes("✓");
              return (
                <span
                  key={p}
                  className="pill"
                  style={{
                    borderColor: done ? "var(--moss)" : "rgba(233,227,211,0.30)",
                    color: done ? "var(--moss)" : "var(--bone-2)",
                    opacity: done ? 1 : 0.65,
                  }}
                >
                  {p}
                </span>
              );
            })}
          </div>
        </div>

        <div className="gutter" style={{ paddingBottom: 24 }}>
          <Link href="/live" className="btn-ember" style={{ width: "100%" }}>
            Start turen{" "}
            <span className="mono" style={{ fontSize: 10, opacity: 0.8 }}>
              · LIVE
            </span>
          </Link>
        </div>
      </main>
      <TabBar />
    </>
  );
}
