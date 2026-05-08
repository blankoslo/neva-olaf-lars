"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  tags: string[];
  content: string | null;
  season: string | null;
  groupSize: number | null;
  tripDate: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ letterSpacing: 2, fontSize: 14 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "var(--ember)" : "rgba(233,227,211,0.15)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function avgRating(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

export default function ReviewsList({ tripId }: { tripId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/trips/${tripId}/reviews`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tripId]);

  if (loading) return null;
  if (!reviews.length) {
    return (
      <section className="mx-frame" style={{ marginTop: 24 }}>
        <div className="flex-row between center" style={{ marginBottom: 12 }}>
          <div className="eyebrow muted">ANMELDELSER</div>
          <Link
            href={`/tur/${tripId}/anmeldelse`}
            className="pill"
            style={{ textDecoration: "none", fontSize: 10 }}
          >
            SKRIV ANMELDELSE
          </Link>
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--slate)", letterSpacing: ".14em", textAlign: "center", padding: "20px 0" }}>
          INGEN ANMELDELSER ENNÅ
        </div>
      </section>
    );
  }

  const avg = avgRating(reviews);

  return (
    <section className="mx-frame" style={{ marginTop: 24 }}>
      <div className="flex-row between center" style={{ marginBottom: 12 }}>
        <div className="flex-row gap-3 center">
          <div className="eyebrow muted">ANMELDELSER</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Stars rating={Math.round(avg)} />
            <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".12em" }}>
              {avg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "anmeldelse" : "anmeldelser"}
            </span>
          </div>
        </div>
        <Link
          href={`/tur/${tripId}/anmeldelse`}
          className="pill"
          style={{ textDecoration: "none", fontSize: 10 }}
        >
          SKRIV
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: "rgba(233,227,211,.04)",
              border: "1px solid rgba(233,227,211,.09)",
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div className="flex-row between center" style={{ marginBottom: 6 }}>
              <Stars rating={r.rating} />
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--slate)" }}>
                {formatDate(r.createdAt)}
              </span>
            </div>

            {/* Context meta */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: r.content ? 8 : 0 }}>
              {r.season && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                  {r.season.toUpperCase()}
                </span>
              )}
              {r.groupSize != null && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                  {r.groupSize} DELTAKERE
                </span>
              )}
              {r.tripDate && (
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--slate)", background: "rgba(233,227,211,.07)", padding: "2px 8px", borderRadius: 999 }}>
                  {new Date(r.tripDate).toLocaleDateString("nb-NO", { month: "short", year: "numeric" }).toUpperCase()}
                </span>
              )}
            </div>

            {/* Tags */}
            {r.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: r.content ? 8 : 0 }}>
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 10,
                      letterSpacing: ".08em",
                      color: "var(--ember)",
                      background: "rgba(244,162,89,.1)",
                      border: "1px solid rgba(244,162,89,.2)",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Free text */}
            {r.content && (
              <p style={{ fontSize: 13, color: "var(--bone-2)", lineHeight: 1.5, margin: 0 }}>
                {r.content}
              </p>
            )}

            <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "rgba(138,147,168,.5)", marginTop: 8 }}>
              {r.user.name ?? r.user.email.split("@")[0]}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
