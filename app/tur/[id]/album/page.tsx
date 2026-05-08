"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import TabBar from "../../../_components/tabbar";

type PhotoMeta = {
  id: string;
  fileName: string | null;
  mimeType: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

export default function AlbumPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();

  const [photos, setPhotos] = useState<PhotoMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchPhotos() {
    const res = await fetch(`/api/trips/${id}/photos`);
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      await fetch(`/api/trips/${id}/photos`, { method: "POST", body: form });
    }
    await fetchPhotos();
    setUploading(false);
  }

  const isLoggedIn = !!session?.user;

  // Group photos by date for chronological display
  const grouped = photos.reduce<Record<string, PhotoMeta[]>>((acc, p) => {
    const dateKey = formatDate(p.createdAt);
    (acc[dateKey] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <main style={{ paddingTop: 24, minHeight: "calc(100dvh - 80px)" }}>
        <div className="page-pad">
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginBottom: 4 }}
          >
            ─── ALBUM
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <h1
              style={{
                fontSize: 30,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                fontWeight: 400,
                margin: 0,
              }}
            >
              Turalbum
            </h1>
            {isLoggedIn && (
              <button
                className="pill"
                style={{ fontSize: 11, letterSpacing: ".12em", cursor: uploading ? "wait" : "pointer" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "LASTER OPP…" : "+ LEGG TIL"}
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files)}
        />

        <div className="page-pad" style={{ marginTop: 24 }}>
          {loading && (
            <div className="mono" style={{ fontSize: 11, opacity: 0.45, letterSpacing: ".18em" }}>
              LASTER…
            </div>
          )}

          {!loading && photos.length === 0 && (
            <div
              className="mono"
              style={{
                fontSize: 11,
                opacity: 0.4,
                letterSpacing: ".15em",
                textAlign: "center",
                marginTop: 60,
                lineHeight: 2,
              }}
            >
              INGEN BILDER ENNÅ.{"\n"}VÆRT DU ALLER FØRST!
            </div>
          )}

          {Object.entries(grouped).map(([date, dayPhotos]) => (
            <div key={date} style={{ marginBottom: 32 }}>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: ".18em",
                  opacity: 0.5,
                  marginBottom: 12,
                }}
              >
                {date.toUpperCase()}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 4,
                }}
              >
                {dayPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setLightbox(photo.id)}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      padding: 0,
                      border: "none",
                      background: "var(--night-3)",
                      cursor: "pointer",
                      overflow: "hidden",
                      borderRadius: 4,
                    }}
                    title={`${photo.user.name ?? photo.user.email} · ${formatTime(photo.createdAt)}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/trips/${id}/photos/${photo.id}`}
                      alt={photo.fileName ?? "Bilde"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "linear-gradient(transparent, rgba(10,15,28,0.75))",
                        padding: "12px 6px 4px",
                      }}
                    >
                      <div
                        className="mono"
                        style={{ fontSize: 8, letterSpacing: ".1em", color: "var(--bone-2)", opacity: 0.85 }}
                      >
                        {(photo.user.name ?? photo.user.email).toUpperCase().slice(0, 12)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(7,10,20,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/trips/${id}/photos/${lightbox}`}
            alt="Bilde"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "100%",
              maxHeight: "80dvh",
              objectFit: "contain",
              borderRadius: 6,
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            }}
          />
          {(() => {
            const p = photos.find((x) => x.id === lightbox);
            if (!p) return null;
            return (
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--bone)" }}>
                  {p.user.name ?? p.user.email}
                </div>
                <div className="mono" style={{ fontSize: 10, opacity: 0.5, letterSpacing: ".12em", marginTop: 4 }}>
                  {formatDate(p.createdAt).toUpperCase()} · {formatTime(p.createdAt)}
                </div>
              </div>
            );
          })()}
          <button
            onClick={() => setLightbox(null)}
            className="pill"
            style={{ marginTop: 20, fontSize: 11, letterSpacing: ".12em" }}
          >
            LUKK
          </button>
        </div>
      )}

      <TabBar />
    </>
  );
}
