"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RepeatTripButton({ tripId }: { tripId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRepeat() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/repeat`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Noe gikk galt.");
        return;
      }
      router.push(`/tur/${data.tripId}`);
    } catch {
      setError("Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleRepeat}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(163,196,160,.10)",
          border: "1px solid rgba(163,196,160,.35)",
          color: "var(--moss)",
          borderRadius: 6,
          padding: "10px 18px",
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: ".14em",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          width: "100%",
          justifyContent: "center",
        }}
      >
        {loading ? "OPPRETTER TUR…" : "↺ GJENTA DENNE TUREN"}
      </button>
      {error && (
        <p style={{ fontSize: 12, color: "var(--ember-2)", marginTop: 8, textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
