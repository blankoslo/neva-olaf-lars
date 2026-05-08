import { WilhelmAvatar, Stamp } from "../_components/wilhelm";
import { RouteMap } from "../_components/maps";
import { Glyph } from "../_components/glyph";
import TabBar from "../_components/tabbar";

export default function LivePage() {
  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Stamp color="var(--ember)" rotate={-3}>· PÅ TUR ·</Stamp>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".16em" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#5b6b5a",
                  marginRight: 6,
                }}
              />
              LIVE · 11:24
            </div>
          </div>
          <h1
            style={{
              marginTop: 14,
              fontSize: 28,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Du er <em>2,4 km</em>
            <br />
            fra Roenshaugen.
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            FORAN · 50 MIN · ↑ 60 M
          </div>
        </div>

        <div className="map-wrap">
          <RouteMap theme="paper" />
          <div style={{ position: "absolute", left: "62%", top: "42%" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "var(--ember)",
                border: "3px solid #ede4d3",
                boxShadow: "0 0 0 4px rgba(217,119,87,.25)",
              }}
            />
          </div>
        </div>

        <div className="stats-grid">
          {[
            { l: "NESTE PUNKT", v: "Hallisetra-ryggen", s: "om 1,1 km" },
            { l: "VÆR", v: "8° · yr", s: "vind 4 m/s NV" },
            { l: "I DAG", v: "8,6 / 14 km", s: "tempo 4,1 km/t" },
            { l: "BATTERI · GPS", v: "62 % · sterkt", s: "solnedg. 19:14" },
          ].map((c) => (
            <div
              key={c.l}
              style={{
                background: "rgba(233,227,211,0.04)",
                border: "1px solid rgba(233,227,211,0.10)",
                borderRadius: 4,
                padding: "10px 12px",
              }}
            >
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".18em", opacity: 0.55 }}>
                {c.l}
              </div>
              <div style={{ fontSize: 15, marginTop: 4, lineHeight: 1.1 }}>{c.v}</div>
              <div className="mono" style={{ fontSize: 9, opacity: 0.55, marginTop: 3 }}>
                {c.s}
              </div>
            </div>
          ))}
        </div>

        <section
          className="mx-frame"
          style={{
            marginTop: 14,
            padding: "12px 14px",
            borderRadius: 4,
            border: "1px dashed rgba(244,162,89,0.40)",
            background: "rgba(244,162,89,0.06)",
            display: "flex",
            gap: 10,
          }}
        >
          <WilhelmAvatar size={40} variant="kraft" />
          <div>
            <div
              className="mono"
              style={{ fontSize: 9, letterSpacing: ".2em", color: "var(--ember)" }}
            >
              HVISKING · 11:24
            </div>
            <p
              className="serif italic"
              style={{
                fontSize: 18,
                color: "var(--bone-2)",
                marginTop: 2,
                lineHeight: 1.15,
                marginBottom: 0,
              }}
            >
              Yret setter seg ved middag. Press det neste kilometeret, så tar du teen din under
              grana ved 9,5.
            </p>
          </div>
        </section>

        <div className="mx-frame" style={{ marginTop: 14, marginBottom: 24, display: "flex", gap: 8 }}>
          <button type="button" className="btn-ghost ui" style={{ flex: 1 }}>
            <Glyph name="pin" size={16} /> Marker sted
          </button>
          <button
            type="button"
            className="btn-ember"
            style={{ background: "var(--night-2)", flex: "0 0 auto" }}
          >
            <Glyph name="sos" size={16} color="#fff" /> SOS
          </button>
        </div>
      </main>
      <TabBar />
    </>
  );
}
