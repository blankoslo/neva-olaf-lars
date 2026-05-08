/**
 * Met.no Locationforecast 2.0 (compact). The TOS requires a non-default
 * User-Agent identifying the app; coordinates must be ≤ 4 decimals.
 *
 * https://api.met.no/weatherapi/locationforecast/2.0/documentation
 */

const USER_AGENT = "Friluftskompis/1.0 hackathon";

type Symbol = { symbol_code?: string };

type MetTimeseries = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        wind_speed?: number;
        wind_from_direction?: number;
        relative_humidity?: number;
      };
    };
    next_1_hours?: { summary?: Symbol; details?: { precipitation_amount?: number } };
    next_6_hours?: { summary?: Symbol; details?: { precipitation_amount?: number } };
    next_12_hours?: { summary?: Symbol };
  };
};

export type DailyForecast = {
  date: string;     // YYYY-MM-DD (UTC)
  weekday: string;  // Nynorsk-style 3-letter abbreviation
  symbol: string;   // raw met.no symbol code
  emoji: string;    // mapped emoji
  temp: number | null;       // representative °C (rounded)
  precipitation: number | null; // mm over the next 6 h, when available
};

const WEEKDAY_NN = ["SØN", "MAN", "TYS", "ONS", "TOR", "FRE", "LAU"];

function symbolToEmoji(code: string): string {
  if (!code) return "·";
  if (code.includes("clearsky")) return "☀";
  if (code.includes("fair")) return "🌤";
  if (code.includes("partlycloudy")) return "⛅";
  if (code.includes("cloudy")) return "☁";
  if (code.includes("thunder")) return "⛈";
  if (code.includes("sleet")) return "🌨";
  if (code.includes("snow")) return "❄";
  if (code.includes("rain") || code.includes("showers")) return "🌧";
  if (code.includes("fog")) return "🌫";
  return "·";
}

/**
 * Fetch a forecast for one location and return one entry per day, choosing
 * the timeseries point closest to 12:00 UTC as the day's representative.
 *
 * Returns [] on any failure — the caller decides whether to render anything.
 */
export async function getForecast(
  lat: number,
  lon: number,
  days = 7,
): Promise<DailyForecast[]> {
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      // Cache 30 min — met.no expects this kind of polite use.
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      properties?: { timeseries?: MetTimeseries[] };
    };
    const series = json?.properties?.timeseries ?? [];
    if (series.length === 0) return [];

    // Pick one entry per day, preferring the one nearest 12:00 UTC.
    const byDate = new Map<string, MetTimeseries>();
    for (const ts of series) {
      const d = new Date(ts.time);
      const dateKey = d.toISOString().slice(0, 10);
      const hour = d.getUTCHours();
      const existing = byDate.get(dateKey);
      if (!existing) {
        byDate.set(dateKey, ts);
      } else {
        const eHour = new Date(existing.time).getUTCHours();
        if (Math.abs(hour - 12) < Math.abs(eHour - 12)) {
          byDate.set(dateKey, ts);
        }
      }
    }

    return Array.from(byDate.entries())
      .slice(0, days)
      .map(([date, ts]) => {
        const symbol =
          ts.data.next_12_hours?.summary?.symbol_code ??
          ts.data.next_6_hours?.summary?.symbol_code ??
          ts.data.next_1_hours?.summary?.symbol_code ??
          "";
        const precipitation =
          ts.data.next_6_hours?.details?.precipitation_amount ??
          ts.data.next_1_hours?.details?.precipitation_amount ??
          null;
        const d = new Date(date);
        const t = ts.data.instant.details.air_temperature;
        return {
          date,
          weekday: WEEKDAY_NN[d.getUTCDay()],
          symbol,
          emoji: symbolToEmoji(symbol),
          temp: typeof t === "number" ? Math.round(t) : null,
          precipitation,
        };
      });
  } catch (err) {
    console.error("[weather] error:", err);
    return [];
  }
}
