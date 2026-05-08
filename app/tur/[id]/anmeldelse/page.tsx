"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import TabBar from "../../../_components/tabbar";

const TAGS = [
  "familievennlig",
  "krevende",
  "naturskjønn",
  "godt merket",
  "egnet for nybegynnere",
  "lang etappe",
  "hytteovernatting",
  "telttur",
  "vinter",
  "sommer",
];

const SEASONS = ["vinter", "vår", "sommer", "høst"];

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 28,
              color: filled ? "var(--ember)" : "rgba(233,227,211,0.18)",
              transition: "color .15s",
            }}
            aria-label={`${n} stjerne${n > 1 ? "r" : ""}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function AnmeldelseForm() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [season, setSeason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState<{ rating: number; tags: string[]; content: string | null; season: string | null } | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const userId = (session?.user as { id?: string } | undefined)?.id;

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/trips/${id}/reviews`);
      if (res.ok) {
        const reviews = await res.json();
        const mine = reviews.find((r: { user: { id: string } }) => r.user.id === userId);
        if (mine) {
          setExisting(mine);
          setRating(mine.rating);
          setSelectedTags(mine.tags ?? []);
          setContent(mine.content ?? "");
          setSeason(mine.season ?? "");
        }
      }
      setLoadingExisting(false);
    }
    if (userId) load();
    else if (status !== "loading") setLoadingExisting(false);
  }, [id, userId, status]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Velg et poeng mellom 1 og 5.");
      return;
    }
    setSending(true);
    setError(null);
    const res = await fetch(`/api/trips/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, tags: selectedTags, content: content || null, season: season || null }),
    });
    if (res.ok) {
      router.push(`/tur/${id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Noe gikk galt. Prøv igjen.");
      setSending(false);
    }
  }

  if (status === "loading" || loadingExisting) {
    return (
      <>
        <main style={{ paddingTop: 24 }}>
          <div className="page-pad">
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.5, textAlign: "center", paddingTop: 40 }}>
              LASTER…
            </div>
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <main style={{ paddingTop: 24 }}>
          <div className="page-pad">
            <div className="mono" style={{ fontSize: 11, color: "var(--slate)", textAlign: "center", paddingTop: 40, letterSpacing: ".14em" }}>
              Du må være innlogget for å skrive anmeldelse.
            </div>
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href={`/tur/${id}`} className="pill" style={{ textDecoration: "none" }}>
              ← TILBAKE
            </Link>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
              ANMELDELSE
            </div>
          </div>

          <h1
            style={{
              marginTop: 18,
              fontSize: 28,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {existing ? "Endre anmeldelse" : "Skriv anmeldelse"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 6, marginBottom: 0 }}>
            Del erfaringen din med andre turfolk.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating */}
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 12 }}>POENG</div>
            <StarRow value={rating} onChange={setRating} />
            {rating > 0 && (
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--slate)", marginTop: 8 }}>
                {["", "Veldig dårlig", "Dårlig", "Greit", "Bra", "Fremragende"][rating].toUpperCase()}
              </div>
            )}
          </section>

          {/* Tags */}
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 12 }}>TAGGER</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      background: active ? "rgba(244,162,89,.18)" : "rgba(233,227,211,.05)",
                      border: `1px solid ${active ? "rgba(244,162,89,.5)" : "rgba(233,227,211,.12)"}`,
                      borderRadius: 999,
                      padding: "5px 12px",
                      fontSize: 11,
                      letterSpacing: ".1em",
                      color: active ? "var(--ember)" : "var(--slate)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Season */}
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 12 }}>SESONG</div>
            <div style={{ display: "flex", gap: 8 }}>
              {SEASONS.map((s) => {
                const active = season === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeason(active ? "" : s)}
                    style={{
                      background: active ? "rgba(244,162,89,.18)" : "rgba(233,227,211,.05)",
                      border: `1px solid ${active ? "rgba(244,162,89,.5)" : "rgba(233,227,211,.12)"}`,
                      borderRadius: 999,
                      padding: "5px 12px",
                      fontSize: 11,
                      letterSpacing: ".1em",
                      color: active ? "var(--ember)" : "var(--slate)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Free text */}
          <section className="mx-frame" style={{ marginTop: 24 }}>
            <div className="eyebrow muted" style={{ marginBottom: 12 }}>FRITEKST (VALGFRITT)</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Del opplevelsen din…"
              style={{
                width: "100%",
                background: "rgba(233,227,211,.04)",
                border: "1px solid rgba(233,227,211,.12)",
                borderRadius: 6,
                padding: "10px 12px",
                color: "var(--bone)",
                fontFamily: "inherit",
                fontSize: 14,
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
              }}
            />
            {content.length > 1800 && (
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: "var(--slate)", marginTop: 4, textAlign: "right" }}>
                {content.length}/2000
              </div>
            )}
          </section>

          {error && (
            <div className="mx-frame" style={{ marginTop: 16, color: "var(--ember-2)", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="mx-frame" style={{ marginTop: 24, paddingBottom: 24 }}>
            <button
              type="submit"
              disabled={sending || rating === 0}
              style={{
                width: "100%",
                background: rating > 0 ? "var(--ember)" : "rgba(244,162,89,.2)",
                border: "none",
                borderRadius: 6,
                padding: "14px 0",
                fontSize: 13,
                fontFamily: "inherit",
                letterSpacing: ".14em",
                color: rating > 0 ? "var(--night)" : "var(--slate)",
                fontWeight: 600,
                cursor: rating > 0 ? "pointer" : "not-allowed",
                transition: "all .2s",
              }}
            >
              {sending ? "SENDER…" : existing ? "OPPDATER ANMELDELSE" : "PUBLISER ANMELDELSE"}
            </button>
          </div>
        </form>
      </main>
      <TabBar />
    </>
  );
}
