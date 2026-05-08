export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { checkUserTableExists } from "@/lib/db-utils";
import { WilhelmAvatar, Stamp } from "./_components/wilhelm";
import { ContourMap } from "./_components/maps";
import { Glyph } from "./_components/glyph";
import TabBar from "./_components/tabbar";

export default async function HomePage() {
  const tableExists = await checkUserTableExists();
  if (!tableExists) redirect("/setup");

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="body-pad">
          <div className="flex-row between center">
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".2em", opacity: 0.55 }}>
              08·05·26 · 04°C · SOLØR
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ember)" }} />
          </div>
          <h1
            style={{
              marginTop: 18,
              fontSize: 42,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            God morgen,
            <br />
            <em>Astrid.</em>
          </h1>
          <p
            className="hand"
            style={{
              marginTop: 12,
              fontSize: 18,
              color: "#1a3a5a",
              transform: "rotate(-1deg)",
            }}
          >
            hvor skal vi gå denne gangen?
          </p>
        </div>

        <section
          className="mx-frame"
          style={{
            marginTop: 20,
            padding: 16,
            background: "#fff8ea",
            border: "1px solid rgba(26,31,26,.18)",
            borderRadius: 4,
            boxShadow: "0 2px 0 rgba(26,31,26,.12)",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: -10, right: 14 }}>
            <Stamp color="#5b6b5a" rotate={4}>· Turfører ·</Stamp>
          </div>
          <div className="flex-row gap-3 center">
            <WilhelmAvatar size={56} variant="ink" />
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
                WILHELM · SIDEN 1962
              </div>
              <div style={{ fontSize: 18, marginTop: 2, lineHeight: 1.15 }}>
                Jeg har gått i disse skogene
                <br />
                siden før kartene fantes.
              </div>
            </div>
          </div>
          <div className="rule" style={{ margin: "12px 0" }} />
          <p className="hand" style={{ fontSize: 17, color: "#1a3a5a", margin: 0 }}>
            Si meg tre dager du har fri. Jeg finner deg en runde med to hytter, et vann, og en stille morgen.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Link href="/tur" className="btn-ember">
              Planlegg en tur <Glyph name="arrow-r" size={16} color="#fff" />
            </Link>
            <button type="button" className="btn-ghost ui">
              Se runder
            </button>
          </div>
        </section>

        <div className="body-pad" style={{ paddingBottom: 4 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
            ─── RUNDER NÆR DEG
          </div>
        </div>
        <div className="runder-row">
          {[
            { name: "Femundsmarka", km: 42, days: 3, t: -1.5 },
            { name: "Trysilfjellet", km: 24, days: 2, t: 1.0 },
            { name: "Gråhøgda", km: 31, days: 2, t: -0.6 },
          ].map((l) => (
            <article
              key={l.name}
              className="runder-card"
              style={{
                background: "#fff8ea",
                border: "1px solid rgba(26,31,26,.18)",
                borderRadius: 4,
                transform: `rotate(${l.t}deg)`,
                padding: 12,
                boxShadow: "0 2px 0 rgba(26,31,26,.10)",
              }}
            >
              <div
                style={{
                  height: 96,
                  background: "#c9b896",
                  borderRadius: 2,
                  marginBottom: 8,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <ContourMap stroke="#1a1f1a" opacity={0.55} />
              </div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".16em", opacity: 0.6 }}>
                {l.km} KM · {l.days} DAGER
              </div>
              <div style={{ fontSize: 18, lineHeight: 1.05, marginTop: 2 }}>{l.name}</div>
            </article>
          ))}
        </div>

        <div className="rule mx-frame" style={{ marginTop: 10, marginBottom: 10 }} />

        <section
          className="mx-frame"
          style={{
            marginTop: 12,
            marginBottom: 24,
            padding: "12px 14px",
            border: "1px dashed rgba(26,31,26,.35)",
            borderRadius: 4,
            display: "flex",
            gap: 10,
          }}
        >
          <WilhelmAvatar size={36} variant="kraft" />
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", opacity: 0.6 }}>
              HVISKING · #214
            </div>
            <p
              className="hand"
              style={{ fontSize: 18, color: "#1a3a5a", marginTop: 2, marginBottom: 0 }}
            >
              Ull over bomull. Alltid. Også om sommeren.
            </p>
          </div>
        </section>
      </main>
      <TabBar />
    </>
  );
}
