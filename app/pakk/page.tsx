"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TabBar from "../_components/tabbar";
import { KEYS, readJSON, writeJSON } from "@/lib/storage";

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

const DEFAULT_DONE = [
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
];

const TOTAL = ITEMS.reduce((sum, g) => sum + g.list.length, 0);

export default function PackPage() {
  const [done, setDone] = useState<Set<string>>(() => new Set(DEFAULT_DONE));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on first paint. We intentionally start with
  // the SSR-rendered defaults and then swap in the persisted set on mount —
  // the alternative (lazy useState init) would read window during SSR.
  useEffect(() => {
    const stored = readJSON<string[]>(KEYS.packing);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setDone(new Set(stored));
    setHydrated(true);
  }, []);

  // Persist whenever the set changes (after hydration to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    writeJSON(KEYS.packing, Array.from(done));
  }, [done, hydrated]);

  function toggle(item: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

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
            {done.size} / {TOTAL} · OPPDATERT 06·09
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
                    onClick={() => toggle(it)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: "1px dashed rgba(233,227,211,0.10)",
                      cursor: "pointer",
                      userSelect: "none",
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
