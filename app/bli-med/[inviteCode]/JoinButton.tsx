"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({
  inviteCode,
  tripId,
}: {
  inviteCode: string;
  tripId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Noe gikk galt.");
        return;
      }
      router.push(`/tur/${tripId}`);
      router.refresh();
    } catch {
      setError("Noe gikk galt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={loading}
        className="btn-ember"
        style={{ width: "100%" }}
      >
        {loading ? "Legger deg til…" : "Bli med på turen"}
      </button>
      {error && (
        <div
          className="mono"
          style={{
            color: "var(--ember-2)",
            fontSize: 11,
            letterSpacing: ".1em",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
