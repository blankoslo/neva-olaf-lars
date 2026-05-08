"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import TabBar from "../../../_components/tabbar";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

export default function SnakkPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();

  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchComments() {
    const res = await fetch(`/api/trips/${id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const res = await fetch(`/api/trips/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      setInput("");
      await fetchComments();
    }
    setSending(false);
  }

  const myId = (session?.user as { id?: string } | undefined)?.id;

  return (
    <>
      <main style={{ paddingTop: 24, display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 80px)" }}>
        <div className="page-pad" style={{ flexShrink: 0 }}>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginBottom: 4 }}
          >
            ─── SNAKK
          </div>
          <h1
            style={{
              fontSize: 30,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
              margin: 0,
            }}
          >
            Turdiskusjon
          </h1>
        </div>

        {/* Messages */}
        <div
          className="page-pad"
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: 16,
            paddingBottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {loading && (
            <div className="mono" style={{ fontSize: 11, opacity: 0.45, letterSpacing: ".18em" }}>
              LASTER…
            </div>
          )}
          {!loading && comments.length === 0 && (
            <div
              className="mono"
              style={{ fontSize: 11, opacity: 0.4, letterSpacing: ".15em", textAlign: "center", marginTop: 40 }}
            >
              INGEN MELDINGER ENNÅ.{"\n"}VÆR DEN FØRSTE!
            </div>
          )}
          {comments.map((c) => {
            const isMe = c.user.id === myId;
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className="mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: ".18em",
                    opacity: 0.5,
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {isMe ? "Du" : (c.user.name || c.user.email.split("@")[0])}
                  {" · "}
                  {new Date(c.createdAt).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "10px 14px",
                    borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: isMe
                      ? "rgba(244,162,89,0.18)"
                      : "rgba(138,147,168,0.13)",
                    border: isMe
                      ? "1px solid rgba(244,162,89,0.3)"
                      : "1px solid rgba(233,227,211,0.1)",
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  {c.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="page-pad"
          style={{
            flexShrink: 0,
            paddingTop: 12,
            paddingBottom: 16,
            display: "flex",
            gap: 8,
            borderTop: "1px solid rgba(233,227,211,0.08)",
            background: "rgba(10,15,28,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv en melding…"
            disabled={!session || sending}
            style={{
              flex: 1,
              background: "rgba(233,227,211,0.06)",
              border: "1px solid rgba(233,227,211,0.15)",
              borderRadius: 999,
              padding: "10px 16px",
              color: "var(--bone)",
              fontSize: 15,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || !session || sending}
            className="btn-ember"
            style={{ padding: "10px 18px", fontSize: 13, flexShrink: 0 }}
          >
            Send
          </button>
        </form>
      </main>
      <TabBar />
    </>
  );
}
