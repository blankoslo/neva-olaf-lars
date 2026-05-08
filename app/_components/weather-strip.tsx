import type { DailyForecast } from "@/lib/weather";

export function WeatherStrip({ days }: { days: DailyForecast[] }) {
  if (!days || days.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {days.map((d) => (
        <div
          key={d.date}
          style={{
            flex: 1,
            padding: "10px 4px",
            textAlign: "center",
            background: "rgba(233,227,211,0.04)",
            border: "1px solid rgba(233,227,211,0.10)",
            borderRadius: 6,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 9,
              color: "var(--slate)",
              letterSpacing: "0.18em",
              marginBottom: 4,
            }}
          >
            {d.weekday}
          </div>
          <div style={{ fontSize: 18, marginBottom: 2, lineHeight: 1 }}>{d.emoji}</div>
          <div style={{ fontSize: 12, color: "var(--bone)", fontWeight: 500 }}>
            {d.temp == null ? "—" : `${d.temp}°`}
          </div>
          {d.precipitation != null && d.precipitation > 0 && (
            <div
              className="mono"
              style={{
                fontSize: 8,
                letterSpacing: "0.1em",
                color: "var(--ember)",
                marginTop: 2,
              }}
            >
              {d.precipitation.toFixed(1)} mm
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
