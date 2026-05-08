"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Monogram } from "./wilhelm";
import { Mountains } from "./maps";
import { Glyph } from "./glyph";
import { SuggestionList, type RouteSuggestion } from "./route-suggestions";
import { Splash } from "./splash";
import { KEYS, readJSON, writeJSON } from "@/lib/storage";

type CachedSession = {
  tripId: string | null;
  messages: Message[];
  fields: Partial<Fields>;
  suggestions: RouteSuggestion[] | null;
  complete: boolean;
};

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
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [suggestions, setSuggestions] = useState<RouteSuggestion[] | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  // Show splash until the user clicks "Start samtale", unless we're resuming
  // a chat via ?chat=<tripId> — in that case skip straight into the thread.
  const [started, setStarted] = useState(
    () => !!searchParams.get("chat"),
  );
  const tripIdRef = useRef<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  // Restore session on mount. We try localStorage first (works offline),
  // then refresh from the server when ?chat=<tripId> is present and we're
  // online — server wins as source of truth.
  useEffect(() => {
    const chatId = searchParams.get("chat");

    const cached = readJSON<CachedSession>(KEYS.chatSession);
    // Only apply cache when it matches the URL — or when there's no URL chat
    // id, in which case the cached session IS the current one.
    const cacheMatchesUrl = cached && (!chatId || cached.tripId === chatId);
    if (cached && cacheMatchesUrl) {
      tripIdRef.current = cached.tripId;
      // Hydrating from localStorage on mount is the whole point — set-state
      // in this effect is intentional, not a cascading-render bug.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached.messages?.length) setMessages(cached.messages);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached.fields) setFields(cached.fields);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached.suggestions?.length) setSuggestions(cached.suggestions);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cached.complete) setComplete(true);
    }

    if (!chatId) {
      setSessionLoaded(true);
      return;
    }
    fetch(`/api/chat/session?tripId=${encodeURIComponent(chatId)}`)
      .then((r) => r.json())
      .then(
        (data: {
          trip: {
            id: string;
            chatState: unknown;
            planningFields: unknown;
            suggestions: unknown;
          } | null;
        }) => {
          if (data.trip) {
            tripIdRef.current = data.trip.id;
            const cs = data.trip.chatState as Message[] | null;
            if (cs && cs.length > 0) setMessages(cs);
            const pf = data.trip.planningFields as Partial<Fields> | null;
            if (pf) setFields(pf);
            const sv = data.trip.suggestions as RouteSuggestion[] | null;
            const isComplete =
              (sv && sv.length > 0) ||
              (pf != null && Object.values(pf).filter(Boolean).length >= 6);
            if (sv && sv.length > 0) {
              setSuggestions(sv);
              setComplete(true);
            } else if (isComplete) {
              setComplete(true);
            }
            writeJSON<CachedSession>(KEYS.chatSession, {
              tripId: data.trip.id,
              messages: (cs ?? []) as Message[],
              fields: (pf ?? {}) as Partial<Fields>,
              suggestions: sv ?? null,
              complete: !!isComplete,
            });
          }
        },
      )
      .catch(() => {
        // Offline or server error — keep the cached session we already
        // applied above.
      })
      .finally(() => setSessionLoaded(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire-and-forget session upsert. Writes to localStorage immediately so
  // the offline-restore path always has the latest state, then PATCHes the
  // server in the background.
  function saveSession(update: {
    chatState?: Message[];
    planningFields?: Partial<Fields>;
    suggestions?: RouteSuggestion[];
  }) {
    if (!sessionLoaded) return;

    const cached = readJSON<CachedSession>(KEYS.chatSession);
    writeJSON<CachedSession>(KEYS.chatSession, {
      tripId: tripIdRef.current ?? cached?.tripId ?? null,
      messages: update.chatState ?? cached?.messages ?? [],
      fields: update.planningFields ?? cached?.fields ?? {},
      suggestions: update.suggestions ?? cached?.suggestions ?? null,
      complete:
        update.suggestions !== undefined
          ? update.suggestions.length > 0
          : cached?.complete ?? false,
    });

    const body: Record<string, unknown> = {};
    if (tripIdRef.current) body.tripId = tripIdRef.current;
    if (update.chatState !== undefined) body.chatState = update.chatState;
    if (update.planningFields !== undefined) body.planningFields = update.planningFields;
    if (update.suggestions !== undefined) body.suggestions = update.suggestions;

    fetch("/api/chat/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data: { tripId?: string }) => {
        if (data.tripId && !tripIdRef.current) {
          tripIdRef.current = data.tripId;
          // Mirror the new tripId into localStorage so the cache row is
          // self-consistent on the next load.
          const c = readJSON<CachedSession>(KEYS.chatSession);
          if (c) writeJSON<CachedSession>(KEYS.chatSession, { ...c, tripId: data.tripId });
          // Update URL so a reload restores this chat
          router.replace(`/?chat=${data.tripId}`, { scroll: false });
        }
      })
      .catch(() => {});
  }

  // Fetch route suggestions and persist them
  function fetchSuggestions(currentFields: Partial<Fields>, currentMessages: Message[]) {
    setSuggestionsLoading(true);
    fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...currentFields, tripId: tripIdRef.current }),
    })
      .then((r) => r.json())
      .then((data: { suggestions: RouteSuggestion[] }) => {
        const s = data.suggestions ?? [];
        setSuggestions(s);
        saveSession({ chatState: currentMessages, planningFields: currentFields, suggestions: s });
      })
      .catch(() => setSuggestions([]))
      .finally(() => setSuggestionsLoading(false));
  }

  // Ask Claude to pick routes when conversation first becomes complete
  useEffect(() => {
    if (!complete || !sessionLoaded) return;
    if (suggestions !== null) return; // already loaded from session or prior fetch
    fetchSuggestions(fields, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, sessionLoaded]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);

    const wasComplete = complete;
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
      const updatedMessages: Message[] = [
        ...next,
        { role: "assistant", content: data.message, pills: data.pills },
      ];
      setMessages(updatedMessages);
      const updatedFields = res.ok && data.fields ? data.fields : fields;
      if (res.ok && data.fields) setFields(updatedFields);
      const nowComplete = !!data.complete;
      if (!res.ok) setError("Wilhelm svarte ikke som forventet.");

      // Persist after every turn
      saveSession({ chatState: updatedMessages, planningFields: updatedFields });

      if (wasComplete) {
        if (nowComplete) {
          // Refinement: re-fetch suggestions with possibly updated fields
          setComplete(true);
          fetchSuggestions(updatedFields, updatedMessages);
        } else {
          // User wants to change something — clear suggestions, keep chatting
          setSuggestions(null);
          setComplete(false);
        }
      } else {
        setComplete(nowComplete);
        // If newly complete, useEffect will trigger fetchSuggestions
      }
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
  const showRefinementInput = complete && !loading;

  if (!started) {
    return <Splash onStart={() => setStarted(true)} />;
  }

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
        {complete && (
          <SuggestionList
            suggestions={suggestions}
            loading={suggestionsLoading}
            region={fields.region ?? null}
            onSelect={(index) => {
              const id = tripIdRef.current;
              const selected = suggestions?.[index];
              if (id && selected) {
                fetch("/api/chat/session", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ tripId: id, selectedSuggestion: selected, packingList: null }),
                }).finally(() => router.push(`/tur/${id}`));
              } else if (id) {
                router.push(`/tur/${id}`);
              }
            }}
          />
        )}

        {showRefinementInput && (
          <>
            <div
              className="mono mx-frame"
              style={{
                fontSize: 9,
                letterSpacing: ".18em",
                opacity: 0.5,
                marginTop: 24,
                marginBottom: 6,
              }}
            >
              ENDRE ELLER STILL SPØRSMÅL
            </div>
            <form onSubmit={onSubmit} className="mx-frame chat-input-row" style={{ marginBottom: 80 }}>
              <input
                type="text"
                className="field"
                placeholder="Gi tilbakemelding på forslagene…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                aria-label="Gi tilbakemelding til Wilhelm"
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
          </>
        )}
      </main>
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
    </section>
  );
}
