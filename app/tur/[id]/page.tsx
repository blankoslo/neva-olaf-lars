import Link from "next/link";
import { notFound } from "next/navigation";
import { Stamp } from "../../_components/wilhelm";
import { Elevation } from "../../_components/maps";
import { Glyph } from "../../_components/glyph";
import TabBar from "../../_components/tabbar";

type DayDetail = {
  pos: string;
  title: string;
  stats: string;
  legs: { km: string; t: string; name: string; note: string }[];
  cabin: { name: string; coord: string; note: string };
};

const DETAILS: Record<string, DayDetail> = {
  "dag-1": {
    pos: "I / III",
    title: "Røvollen til Linneset",
    stats: "11 KM · 4 T 30 · ↑ 280 M · ↓ 210 M",
    legs: [
      { km: "0 km", t: "07:40", name: "Røvollen", note: "Sjekk innleveringskoden i postkassen." },
      { km: "5 km", t: "09:10", name: "Skogtjernet", note: "Drikk her — vannet er klart." },
      { km: "11 km", t: "12:10", name: "Linneset hytte", note: "Veden ligger bak skåret. Hugg etter du har varmet deg." },
    ],
    cabin: {
      name: "Linneset",
      coord: "60,9322 N · 12,3812 Ø · 4 KØYER · GASS",
      note: "Vinduet ut mot vannet sitter litt skjevt — løft før du lukker.",
    },
  },
  "dag-2": {
    pos: "II / III",
    title: "Linneset til Roenshaugen",
    stats: "14 KM · 5 T 15 · ↑ 410 M · ↓ 320 M",
    legs: [
      { km: "0 km", t: "06:30", name: "Linneset hytte", note: "Kok vann før du går. Skriv i boka." },
      { km: "4 km", t: "08:00", name: "Bråtebekken bru", note: "Tråkk til venstre for den råtne planken." },
      { km: "9 km", t: "10:45", name: "Hallisetra-ryggen", note: "Lunsj her. Det er ly mot vinden." },
      { km: "14 km", t: "12:50", name: "Roenshaugen hytte", note: "Nøkkelen ligger under den tredje steinen." },
    ],
    cabin: {
      name: "Roenshaugen",
      coord: "60,9871 N · 12,4502 Ø · 6 KØYER · VED",
      note: "Ovnen ryker når du fyrer kald. Tenn opp med opptenningsved først, slik jeg viste deg.",
    },
  },
  "dag-3": {
    pos: "III / III",
    title: "Roenshaugen til Røvollen",
    stats: "13 KM · 4 T 50 · ↑ 220 M · ↓ 380 M",
    legs: [
      { km: "0 km", t: "08:00", name: "Roenshaugen hytte", note: "Sopelimen står bak ovnen — sett alt på plass." },
      { km: "6 km", t: "10:15", name: "Storberget", note: "Stien er lett å miste — følg de blå merkene." },
      { km: "13 km", t: "12:50", name: "Røvollen", note: "Kaffe på Røvollen kafé. Anbefaler skillingsbollen." },
    ],
    cabin: {
      name: "Røvollen",
      coord: "60,8911 N · 12,3120 Ø · BIL · BUSSHOLDEPLASS",
      note: "Bussen til Elverum går 14:20. Du rekker den med god margin.",
    },
  },
};

export function generateStaticParams() {
  return Object.keys(DETAILS).map((id) => ({ id }));
}

export default async function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = DETAILS[id];
  if (!d) notFound();

  const totalKm = parseInt(d.stats);
  const halfKm = Math.round(totalKm / 2);

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href="/tur" className="pill" style={{ textDecoration: "none" }}>
              ← OVERSIKT
            </Link>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
              DAG {d.pos}
            </div>
          </div>
          <h1
            style={{
              marginTop: 18,
              fontSize: 30,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {d.title.split(" til ")[0]} til <em>{d.title.split(" til ")[1]}.</em>
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            {d.stats}
          </div>
        </div>

        <div
          className="mx-frame"
          style={{
            marginTop: 18,
            padding: "12px 14px",
            background: "#fff8ea",
            border: "1px solid rgba(26,31,26,.2)",
            borderRadius: 4,
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 9, letterSpacing: ".18em", opacity: 0.6, marginBottom: 6 }}
          >
            HØYDE · M
          </div>
          <Elevation />
          <div
            className="flex-row between mono"
            style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}
          >
            <span>0 KM</span>
            <span>{halfKm}</span>
            <span>{totalKm} KM</span>
          </div>
        </div>

        <div className="page-pad">
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
            ─── ETAPPER
          </div>
        </div>
        <div className="gutter" style={{ paddingTop: 8, paddingBottom: 8 }}>
          {d.legs.map((s, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 12,
                padding: "10px 0",
                borderBottom:
                  i < d.legs.length - 1 ? "1px dashed rgba(26,31,26,.22)" : "none",
              }}
            >
              <div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: ".1em" }}>
                  {s.t}
                </div>
                <div className="mono" style={{ fontSize: 9, opacity: 0.55, marginTop: 2 }}>
                  {s.km}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 16, lineHeight: 1.15 }}>{s.name}</div>
                <div className="hand" style={{ fontSize: 15, color: "#1a3a5a", marginTop: 2 }}>
                  {s.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section
          className="mx-frame"
          style={{
            marginTop: 14,
            marginBottom: 24,
            padding: 14,
            background: "#fff8ea",
            border: "1px solid rgba(26,31,26,.2)",
            borderRadius: 4,
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: -10, right: 12 }}>
            <Stamp color="#5b6b5a">DNT · selvbetjent</Stamp>
          </div>
          <div className="flex-row gap-3 center">
            <Glyph name="cabin" size={28} />
            <div>
              <div style={{ fontSize: 18, lineHeight: 1.1 }}>{d.cabin.name}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", opacity: 0.6 }}>
                {d.cabin.coord}
              </div>
            </div>
          </div>
          <p className="hand" style={{ marginTop: 10, fontSize: 17, color: "#1a3a5a", marginBottom: 0 }}>
            {d.cabin.note}
          </p>
        </section>
      </main>
      <TabBar />
    </>
  );
}
