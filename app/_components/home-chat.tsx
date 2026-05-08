"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { WilhelmAvatar, Stamp } from "./wilhelm";
import { Glyph } from "./glyph";
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

type Message = {
  role: Role;
  content: string;
  pills?: string[];
};

type ApiResponse = {
  message: string;
  pills?: string[];
  fields: Partial<Fields>;
  complete: boolean;
};

const FIELD_LABELS: { key: keyof Fields; label: string }[] = [
  { key: "people", label: "Følge" },
  { key: "region", label: "Sted" },
  { key: "days", label: "Lengde" },
  { key: "when", label: "Når" },
  { key: "vibe", label: "Karakter" },
  { key: "accommodation", label: "Overnatting" },
];

export default function HomeChat() {
  const { data: session } = useSession();
  const firstName = (session?.user?.name ?? "").split(" ")[0];
  const greeting = firstName ? `God morgen, ${firstName}.` : "God morgen.";
  const introduction = firstName
    ? `God morgen, ${firstName}. Si meg — hva har du lyst på? En lang tur i fjellet, en stille hyttehelg, eller noe helt annet? Skriv så mye eller så lite du vil.`
    : "God morgen. Si meg — hva har du lyst på? En lang tur i fjellet, en stille hyttehelg, eller noe helt annet? Skriv så mye eller så lite du vil.";

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: introduction },
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
      if (!res.ok) setError("Wilhelm svarte ikke som forventet.");
    } catch {
      setError("Mistet kontakten. Prøv igjen.");
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
      <main style={{ paddingTop: 24 }}>
        <header className="body-pad">
          <div className="flex-row gap-3 center">
            <WilhelmAvatar size={56} variant="ink" />
            <div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
                WILHELM · SIDEN 1962
              </div>
              <h1
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  fontWeight: 400,
                  marginTop: 4,
                }}
              >
                {greeting}
              </h1>
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
          <div className="mx-frame chat-pills">
            {pills.map((p) => (
              <button
                key={p}
                type="button"
                className="pill chat-pill"
                onClick={() => send(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {!complete && (
          <form onSubmit={onSubmit} className="mx-frame chat-input-row">
            <input
              type="text"
              className="field"
              placeholder="Skriv her…"
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
              <Glyph name="arrow-r" size={16} color="#fff" />
            </button>
          </form>
        )}

        {error && (
          <div
            className="mono mx-frame"
            style={{
              color: "var(--ember-2)",
              fontSize: 11,
              letterSpacing: ".1em",
              marginTop: 10,
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
      <WilhelmAvatar size={32} variant="ink" />
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
      className="mx-frame summary-card"
      style={{
        marginTop: 18,
        marginBottom: 24,
        padding: 16,
        background: "#fff8ea",
        border: "1px solid rgba(26,31,26,.18)",
        borderRadius: 4,
        boxShadow: "0 2px 0 rgba(26,31,26,.12)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: -10, right: 14 }}>
        <Stamp color="#5b6b5a" rotate={3}>· OK · klar ·</Stamp>
      </div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
        TURFORSLAG · UTKAST
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
        {FIELD_LABELS.map(({ key, label }) => {
          const v = fields[key];
          return (
            <li
              key={key}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px dashed rgba(26,31,26,.2)",
              }}
            >
              <span
                className="mono"
                style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}
              >
                {label.toUpperCase()}
              </span>
              <span style={{ fontSize: 16 }}>{v ?? "—"}</span>
            </li>
          );
        })}
      </ul>
      <Link
        href="/tur"
        className="btn-ember"
        style={{ width: "100%", marginTop: 14 }}
      >
        Planlegg turen <Glyph name="arrow-r" size={16} color="#fff" />
      </Link>
    </section>
  );
}
