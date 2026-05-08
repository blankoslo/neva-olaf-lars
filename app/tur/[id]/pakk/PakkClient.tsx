"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PackItem } from "../../../api/trips/[id]/pack/route";

const CATEGORIES = ["På kroppen", "I sekken", "Mat & drikke", "Navigasjon", "Annet"];

function AiBadge() {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 7,
        letterSpacing: ".16em",
        color: "#7c9ecc",
        background: "rgba(100,148,210,0.10)",
        border: "1px solid rgba(100,148,210,0.22)",
        padding: "1px 5px",
        borderRadius: 2,
        flexShrink: 0,
        lineHeight: "16px",
      }}
    >
      AI
    </span>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-checked={checked}
      role="checkbox"
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: `1.5px solid ${checked ? "var(--moss)" : "rgba(233,227,211,.22)"}`,
        background: checked ? "var(--moss)" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background .1s, border-color .1s",
        padding: 0,
      }}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4.5L4 7.5L10 1" stroke="#0a0f1c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function AddItemRow({
  onAdd,
}: {
  onAdd: (label: string, cat: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [cat, setCat] = useState("Annet");
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = label.trim();
    if (!trimmed) return;
    onAdd(trimmed, cat);
    setLabel("");
    setOpen(false);
  }

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          background: "none",
          border: "1px dashed rgba(233,227,211,0.18)",
          borderRadius: 6,
          padding: "10px 14px",
          cursor: "pointer",
          marginTop: 12,
          color: "var(--slate)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="var(--slate)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
          }}
        >
          Legg til utstyr
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: 12,
        border: "1px solid rgba(233,227,211,0.18)",
        borderRadius: 6,
        overflow: "hidden",
        background: "rgba(233,227,211,0.03)",
      }}
    >
      <input
        ref={inputRef}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Navn på utstyr…"
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(233,227,211,0.10)",
          padding: "11px 14px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "var(--bone)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(10,15,28,0.8)",
            border: "1px solid rgba(233,227,211,0.14)",
            borderRadius: 4,
            padding: "5px 8px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: ".12em",
            color: "var(--bone-2)",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={submit}
          disabled={!label.trim()}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: ".18em",
            padding: "6px 14px",
            borderRadius: 4,
            border: "1px solid rgba(244,162,89,.4)",
            background: label.trim() ? "rgba(244,162,89,.14)" : "transparent",
            color: label.trim() ? "var(--ember)" : "var(--slate)",
            cursor: label.trim() ? "pointer" : "default",
            transition: "background .1s",
          }}
        >
          LEGG TIL
        </button>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--slate)",
            fontSize: 14,
            padding: "4px 6px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function PakkClient({
  tripId,
  tripTitle,
  region,
  days,
  participantCount,
  hasSelectedSuggestion,
}: {
  tripId: string;
  tripTitle: string | null;
  region: string | null;
  days: number;
  participantCount: number;
  hasSelectedSuggestion: boolean;
}) {
  const [items, setItems] = useState<PackItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load
  useEffect(() => {
    fetch(`/api/trips/${tripId}/pack`)
      .then((r) => r.json())
      .then((d: { items?: PackItem[] }) => {
        setItems(d.items ?? []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Debounced save
  const save = useCallback(
    (updated: PackItem[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/trips/${tripId}/pack`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updated }),
        }).catch(() => {});
      }, 600);
    },
    [tripId],
  );

  function toggle(id: string) {
    setItems((prev) => {
      if (!prev) return prev;
      const next = prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
      save(next);
      return next;
    });
  }

  function addItem(label: string, cat: string) {
    setItems((prev) => {
      if (!prev) return prev;
      const next: PackItem[] = [
        ...prev,
        {
          id: `user-${Date.now()}`,
          cat,
          label,
          aiGenerated: false,
          checked: false,
        },
      ];
      save(next);
      return next;
    });
  }

  function removeItem(id: string) {
    setItems((prev) => {
      if (!prev) return prev;
      const next = prev.filter((it) => it.id !== id);
      save(next);
      return next;
    });
  }

  // Group items by category (preserve category order)
  const grouped: { cat: string; items: PackItem[] }[] = [];
  if (items) {
    const seen = new Map<string, PackItem[]>();
    for (const item of items) {
      if (!seen.has(item.cat)) seen.set(item.cat, []);
      seen.get(item.cat)!.push(item);
    }
    seen.forEach((catItems, cat) => grouped.push({ cat, items: catItems }));
  }

  const checkedCount = items?.filter((i) => i.checked).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <main style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div className="page-pad">
        <a href={`/tur/${tripId}`} className="pill" style={{ textDecoration: "none" }}>
          ← TILBAKE
        </a>
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
          {tripTitle && (
            <>
              <br />
              <em style={{ fontSize: 26 }}>{tripTitle}</em>
            </>
          )}
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          {region && (
            <span
              className="mono"
              style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}
            >
              {region.toUpperCase()}
              {days ? ` · ${days} DAG${days > 1 ? "ER" : ""}` : ""}
              {participantCount > 0 ? ` · ${participantCount} DELTAKER${participantCount !== 1 ? "E" : ""}` : ""}
            </span>
          )}
          {!loading && totalCount > 0 && (
            <span
              className="mono"
              style={{
                fontSize: 9,
                letterSpacing: ".14em",
                color: checkedCount === totalCount ? "var(--moss)" : "var(--slate)",
              }}
            >
              {checkedCount} / {totalCount}
            </span>
          )}
          {hasSelectedSuggestion && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 8,
                  letterSpacing: ".16em",
                  color: "#7c9ecc",
                  background: "rgba(100,148,210,0.10)",
                  border: "1px solid rgba(100,148,210,0.22)",
                  padding: "2px 7px",
                  borderRadius: 2,
                }}
              >
                AI-GENERERT
              </span>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "var(--slate)",
                  opacity: 0.7,
                }}
              >
                Tilpasset vær, varighet og deltakere
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--slate)",
            letterSpacing: ".18em",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          LASTER PAKKELISTE…
        </div>
      )}

      {!loading && items !== null && grouped.length === 0 && (
        <div className="page-pad" style={{ marginTop: 24 }}>
          <div
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--slate)",
              textAlign: "center",
              padding: "24px 0",
              letterSpacing: ".14em",
            }}
          >
            INGEN TUR VALGT ENNÅ
          </div>
        </div>
      )}

      {!loading &&
        grouped.map(({ cat, items: catItems }) => (
          <section key={cat} className="page-pad" style={{ marginTop: 4 }}>
            <div
              className="mono"
              style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginBottom: 2 }}
            >
              ─── {cat.toUpperCase()}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {catItems.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 0",
                    borderBottom: "1px dashed rgba(233,227,211,0.08)",
                  }}
                >
                  <Checkbox checked={item.checked} onChange={() => toggle(item.id)} />
                  <span
                    style={{
                      fontSize: 15,
                      color: item.checked ? "var(--slate)" : "var(--bone)",
                      textDecoration: item.checked ? "line-through" : "none",
                      flex: 1,
                      transition: "color .1s",
                    }}
                  >
                    {item.label}
                  </span>
                  {item.aiGenerated && <AiBadge />}
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Fjern ${item.label}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--slate)",
                      opacity: 0.35,
                      padding: "2px 4px",
                      lineHeight: 1,
                      fontSize: 14,
                      flexShrink: 0,
                      transition: "opacity .15s",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.35")}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {!loading && items !== null && (
        <div className="page-pad">
          <AddItemRow onAdd={addItem} />
        </div>
      )}
    </main>
  );
}
