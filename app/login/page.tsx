"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { WilhelmAvatar, Stamp } from "../_components/wilhelm";
import { Glyph } from "../_components/glyph";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const response = await signIn("credentials", {
        ...Object.fromEntries(formData),
        redirect: false,
      });

      if (response?.error) {
        setError("Feil e-post eller passord.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Noe gikk galt under innlogging.");
    }
  }

  return (
    <main style={{ paddingTop: 24 }}>
      <div style={{ padding: "16px 22px 0" }}>
        <div className="flex-row between center">
          <Link href="/" className="pill" style={{ textDecoration: "none" }}>
            ← TILBAKE
          </Link>
          <Stamp color="var(--moss)" rotate={-3}>· Velkommen ·</Stamp>
        </div>
        <h1
          style={{
            marginTop: 18,
            fontSize: 38,
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          God dag.<br />
          <em>Logg inn.</em>
        </h1>
      </div>

      <section
        style={{
          margin: "20px 18px 0",
          padding: 16,
          background: "rgba(233,227,211,0.04)",
          border: "1px solid rgba(233,227,211,0.10)",
          borderRadius: 4,
          boxShadow: "none",
          position: "relative",
        }}
      >
        <div className="flex-row gap-3 center" style={{ marginBottom: 8 }}>
          <WilhelmAvatar size={44} variant="ink" />
          <div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
              WILHELM · DØRA
            </div>
            <p
              className="serif italic"
              style={{
                fontSize: 16,
                color: "var(--bone-2)",
                margin: "2px 0 0",
                lineHeight: 1.2,
              }}
            >
              Kom inn — kaffen er nettopp satt på.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
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
                color: "var(--ember)",
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
            Logg inn <Glyph name="arrow-r" size={16} color="#fff" />
          </button>
        </form>
      </section>

      <div style={{ padding: "18px 22px 32px", textAlign: "center" }}>
        <Link
          href="/register"
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "var(--ember)",
            textDecoration: "none",
          }}
        >
          Ingen konto? Registrer deg →
        </Link>
      </div>
    </main>
  );
}
