"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { WilhelmAvatar, Stamp } from "../_components/wilhelm";
import { Glyph } from "../_components/glyph";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const signInResult = await signIn("credentials", {
        ...Object.fromEntries(formData),
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Klarte ikke å logge inn etter registrering.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registrering feilet.");
    }
  }

  return (
    <main style={{ paddingTop: 24 }}>
      <div style={{ padding: "16px 22px 0" }}>
        <div className="flex-row between center">
          <Link href="/" className="pill" style={{ textDecoration: "none" }}>
            ← TILBAKE
          </Link>
          <Stamp color="#b85a3c" rotate={3}>· Ny i skogen ·</Stamp>
        </div>
        <h1
          style={{
            marginTop: 18,
            fontSize: 36,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          Skriv deg inn<br />
          <em>i boka.</em>
        </h1>
      </div>

      <section
        style={{
          margin: "20px 18px 0",
          padding: 16,
          background: "#fff8ea",
          border: "1px solid rgba(26,31,26,.18)",
          borderRadius: 4,
          boxShadow: "0 2px 0 rgba(26,31,26,.10)",
        }}
      >
        <div className="flex-row gap-3 center" style={{ marginBottom: 8 }}>
          <WilhelmAvatar size={44} variant="kraft" />
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
              WILHELM · GJESTEBOK
            </div>
            <p
              className="hand"
              style={{
                fontSize: 16,
                color: "#1a3a5a",
                margin: "2px 0 0",
                lineHeight: 1.2,
              }}
            >
              Skriv navnet ditt — så husker jeg deg når du kommer igjen.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="name" className="field-label">
              Navn
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Astrid Lien"
              className="field"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email" className="field-label">
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="navn@domene.no"
              className="field"
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password" className="field-label">
              Passord
            </label>
            <input id="password" name="password" type="password" required className="field" />
          </div>

          {error && (
            <div
              className="mono"
              style={{
                color: "var(--ember-2)",
                fontSize: 11,
                letterSpacing: ".1em",
                margin: "8px 0",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" className="btn-ember" style={{ width: "100%", marginTop: 6 }}>
            Registrer meg <Glyph name="arrow-r" size={16} color="#fff" />
          </button>
        </form>
      </section>

      <div style={{ padding: "18px 22px 32px", textAlign: "center" }}>
        <Link
          href="/login"
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--ember-2)",
            textDecoration: "none",
          }}
        >
          Har du allerede konto? Logg inn →
        </Link>
      </div>
    </main>
  );
}
