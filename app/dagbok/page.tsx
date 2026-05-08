import { WilhelmAvatar, Stamp } from "../_components/wilhelm";
import TabBar from "../_components/tabbar";

export default function JournalPage() {
  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Stamp color="var(--moss)" rotate={-3}>fullført · 14·09</Stamp>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
              DAGBOK · 042
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
            Tre dager i <em>Finnskogen.</em>
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            12.—14. SEPT · 38 KM · 14 T 35
          </div>
        </div>

        <div className="collage-grid mx-frame" style={{ marginTop: 18 }}>
          <div className="tilt-l">
            <div className="img-slot" style={{ width: "100%", aspectRatio: "4/5" }}>
              VANNET
              <br />
              VED DAGGRY
            </div>
          </div>
          <div className="stack flex-row col gap-2">
            <div className="tilt-r">
              <div className="img-slot" style={{ width: "100%", aspectRatio: "1" }}>
                HYTTE
              </div>
            </div>
            <div className="tilt-l">
              <div className="img-slot" style={{ width: "100%", aspectRatio: "1" }}>
                STIEN
              </div>
            </div>
          </div>
        </div>

        <div className="page-pad">
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
            ─── STEMPLER
          </div>
        </div>
        <div
          className="mx-frame"
          style={{
            display: "flex",
            gap: 10,
            paddingTop: 12,
            flexWrap: "wrap",
          }}
        >
          <Stamp color="var(--ember)" rotate={-4}>3 hytter · 2 netter</Stamp>
          <Stamp color="var(--moss)" rotate={2}>finnskogen · 38 km</Stamp>
          <Stamp color="var(--bone)" rotate={-1}>første regntur</Stamp>
        </div>

        <section
          className="mx-frame"
          style={{
            marginTop: 18,
            marginBottom: 24,
            padding: "14px 16px",
            background: "rgba(233,227,211,0.04)",
            border: "1px solid rgba(233,227,211,0.10)",
            borderRadius: 4,
            transform: "rotate(-0.6deg)",
          }}
        >
          <div className="flex-row gap-3 center">
            <WilhelmAvatar size={40} variant="ink" />
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".2em", opacity: 0.6 }}>
              WILHELM · BREV
            </div>
          </div>
          <p
            className="serif italic"
            style={{
              marginTop: 10,
              fontSize: 18,
              color: "var(--bone-2)",
              lineHeight: 1.18,
              marginBottom: 0,
            }}
          >
            Du gikk gjennom regn uten å klage en eneste gang. Skogen husker slikt. Kom tilbake om
            vinteren — stillheten er en annen da.
          </p>
          <p
            className="serif italic"
            style={{
              marginTop: 8,
              fontSize: 22,
              color: "var(--bone-2)",
              textAlign: "right",
              marginBottom: 0,
            }}
          >
            — Wilhelm
          </p>
        </section>
      </main>
      <TabBar />
    </>
  );
}
