"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Monogram } from "./wilhelm";
import { Mountains } from "./maps";
import TabBar from "./tabbar";

type Role = "user" | "assistant";

type Fields = {
  people: number | null;
  region: string | null;
  days: number | null;
  when: string | null;
  vibe: string | null;
  accommodation: string | null;
};

type Message = { role: Role; content: string; pills?: string[] };

type ApiResponse = {
  message: string;
  pills?: string[];
  fields: Partial<Fields>;
  complete: boolean;
};

const FIELD_LABELS: { key: keyof Fields; label: string }[] = [
  { key: "people", label: "Følge" },
  { key: "region", label: "Stad" },
  { key: "days", label: "Lengd" },
  { key: "when", label: "Når" },
  { key: "vibe", label: "Karakter" },
  { key: "accommodation", label: "Overnatting" },
];

const INTRO_NO_NAME =
  "«Goddag. So du tenkjer på fjellet, du au?» Sett deg ned. Fortel kva du har lyst på — fjelltoppar, ro, eller selskap. Skriv så mykje eller så lite du vil.";
const introWithName = (n: string) =>
  `«Goddag, ${n}. So du tenkjer på fjellet, du au?» Sett deg ned. Fortel kva du har lyst på — fjelltoppar, ro, eller selskap. Skriv så mykje eller så lite du vil.`;

export default function HomeChat() {
  const { data: session } = useSession();
  const firstName = (session?.user?.name ?? "").split(" ")[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: firstName ? introWithName(firstName) : INTRO_NO_NAME,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Partial<Fields>>({});
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, complete]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || complete) return;
    setError(null);

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as ApiResponse;
      setMessages([
        ...next,
        { role: "assistant", content: data.message, pills: data.pills },
      ]);
      if (res.ok && data.fields) setFields(data.fields);
      setComplete(!!data.complete);
      if (!res.ok) setError("Wilhelm svara ikkje som venta.");
    } catch {
      setError("Mista kontakta. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const pills = !complete && !loading ? lastAssistant?.pills ?? [] : [];

  return (
    <>
      {/* Ambient backdrop — sits behind all content within the shell */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.35,
        }}
      >
        <Mountains opacity={0.6} withSky />
      </div>
      {/* Ember glow at the bottom — campfire warmth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 280,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(244,162,89,0.22), rgba(244,162,89,0) 70%)",
        }}
      />

      <main style={{ position: "relative", zIndex: 1, paddingTop: 8 }}>
        <header className="body-pad">
          <div className="flex-row gap-3 center">
            <Monogram size={56} ember />
            <div>
              <div className="eyebrow muted" style={{ fontSize: 9 }}>
                ANNO · FRILUFTSKOMPIS
              </div>
              <div
                className="display"
                style={{ fontSize: 30, marginTop: 6 }}
              >
                Wilhelm <span className="italic">Tyskeberge.</span>
              </div>
              <div
                className="serif italic"
                style={{ fontSize: 14, color: "var(--bone-2)", marginTop: 4 }}
              >
                Bestefar frå Vågå · sytti år i fjellet.
              </div>
            </div>
          </div>
        </header>

        <section className="mx-frame chat-thread">
          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <WilhelmBubble key={i} text={m.content} />
            ) : (
              <UserBubble key={i} text={m.content} />
            ),
          )}
          {loading && <WilhelmBubble text="…" muted />}
          <div ref={endRef} />
        </section>

        {pills.length > 0 && (
          <div className="mx-frame">
            <div
              className="eyebrow muted"
              style={{ marginTop: 18, marginBottom: 8 }}
            >
              ─── FORSLAG TIL SVAR
            </div>
            <div className="chat-pills" style={{ marginTop: 0 }}>
              {pills.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="chat-pill"
                  onClick={() => send(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {!complete && (
          <form onSubmit={onSubmit} className="mx-frame chat-input-row">
            <input
              type="text"
              className="field"
              placeholder="Skriv til Wilhelm…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              aria-label="Skriv til Wilhelm"
            />
            <button
              type="submit"
              className="btn-ember chat-send"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <span
                aria-hidden
                style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}
              >
                ↑
              </span>
            </button>
          </form>
        )}

        {error && (
          <div
            className="mono mx-frame"
            style={{
              color: "var(--ember-2)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {complete && <SummaryCard fields={fields} />}
      </main>
      <TabBar />
    </>
  );
}

function WilhelmBubble({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <div className="bubble bubble-wilhelm" style={muted ? { opacity: 0.55 } : undefined}>
      <Monogram size={32} ember />
      <div className="bubble-card">{text}</div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="bubble bubble-user">
      <div className="bubble-card bubble-card-user">{text}</div>
    </div>
  );
}

function SummaryCard({ fields }: { fields: Partial<Fields> }) {
  return (
    <section
      className="mx-frame panel panel-ember"
      style={{ marginTop: 22, marginBottom: 28, position: "relative" }}
    >
      <span className="wilhelms-pick">WILHELMS UTKAST</span>
      <div className="eyebrow muted" style={{ marginTop: 4 }}>
        TURFORSLAG · UTKAST
      </div>
      <div
        className="display italic"
        style={{ fontSize: 28, marginTop: 10, marginBottom: 14 }}
      >
        For dykk, då.
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {FIELD_LABELS.map(({ key, label }) => {
          const v = fields[key];
          return (
            <li
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "112px 1fr",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid rgba(233,227,211,0.10)",
              }}
            >
              <span
                className="mono"
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  color: "var(--slate)",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
              <span
                className="serif"
                style={{ fontSize: 17, color: "var(--bone)" }}
              >
                {v ?? "—"}
              </span>
            </li>
          );
        })}
      </ul>
      <Link
        href="/tur"
        className="btn-ember"
        style={{ width: "100%", marginTop: 18 }}
      >
        Vis tre forslag <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
