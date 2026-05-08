"use client";

import { useCallback, useEffect, useState } from "react";

type Participant = { id: string; name: string | null; email: string };
type ExpenseUser = { id: string; name: string | null; email: string };
type Expense = {
  id: string;
  amount: number;
  description: string;
  splitAmong: string[] | null;
  createdAt: string;
  paidBy: ExpenseUser;
};
type Transfer = { from: string; to: string; amount: number };

function displayName(user: { name: string | null; email: string }) {
  return user.name ?? user.email.split("@")[0];
}

function formatNok(amount: number) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function AddExpenseForm({
  participants,
  currentUserId,
  onAdd,
}: {
  participants: Participant[];
  currentUserId: string;
  onAdd: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByUserId, setPaidByUserId] = useState(currentUserId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(amt) || amt <= 0) {
      setError("Fyll inn beskrivelse og gyldig beløp.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${participants[0]?.id ?? ""}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), amount: amt, paidByUserId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Noe gikk galt.");
        return;
      }
      setDescription("");
      setAmount("");
      setPaidByUserId(currentUserId);
      onAdd();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Beskrivelse (f.eks. dagligvarer)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          inputMode="decimal"
          placeholder="Beløp kr"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ ...inputStyle, width: 100, flexShrink: 0 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ color: "rgba(233,227,211,.55)", fontSize: 13 }}>Betalt av:</label>
        <select
          value={paidByUserId}
          onChange={(e) => setPaidByUserId(e.target.value)}
          style={{
            ...inputStyle,
            flex: 1,
            background: "rgba(233,227,211,.06)",
          }}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {displayName(p)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--moss, #4e7c5f)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          {saving ? "Lagrer…" : "Legg til"}
        </button>
      </div>
      {error && <p style={{ color: "#e87878", fontSize: 13, margin: 0 }}>{error}</p>}
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(233,227,211,.08)",
  border: "1px solid rgba(233,227,211,.14)",
  borderRadius: 8,
  color: "#e9e3d3",
  fontSize: 14,
  padding: "8px 12px",
  flex: 1,
  outline: "none",
};

function SplitSection({
  split,
  participants,
  currentUserId,
}: {
  split: Transfer[];
  participants: Participant[];
  currentUserId: string;
}) {
  const byId = Object.fromEntries(participants.map((p) => [p.id, p]));

  const myTransfers = split.filter(
    (t) => t.from === currentUserId || t.to === currentUserId,
  );

  if (split.length === 0) {
    return (
      <p style={{ color: "rgba(233,227,211,.45)", fontSize: 14, margin: 0 }}>
        Ingen utgifter å fordele ennå.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {myTransfers.length > 0 && (
        <div
          style={{
            background: "rgba(233,227,211,.06)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, letterSpacing: ".12em", color: "rgba(233,227,211,.45)", textTransform: "uppercase" }}>
            Din saldo
          </p>
          {myTransfers.map((t, i) => {
            const isDebtor = t.from === currentUserId;
            const other = byId[isDebtor ? t.to : t.from];
            return (
              <p key={i} style={{ margin: 0, fontSize: 15, fontWeight: 600, color: isDebtor ? "#e87878" : "#7ec89e" }}>
                {isDebtor
                  ? `Du skylder ${displayName(other ?? { name: null, email: t.to })} ${formatNok(t.amount)}`
                  : `${displayName(other ?? { name: null, email: t.from })} skylder deg ${formatNok(t.amount)}`}
              </p>
            );
          })}
        </div>
      )}
      <p style={{ margin: 0, fontSize: 11, letterSpacing: ".12em", color: "rgba(233,227,211,.45)", textTransform: "uppercase" }}>
        Alle overføringer ({split.length})
      </p>
      {split.map((t, i) => {
        const from = byId[t.from];
        const to = byId[t.to];
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "rgba(233,227,211,.8)",
              padding: "6px 0",
              borderBottom: "1px solid rgba(233,227,211,.07)",
            }}
          >
            <span style={{ flex: 1 }}>
              {displayName(from ?? { name: null, email: t.from })}
            </span>
            <span style={{ color: "rgba(233,227,211,.35)", fontSize: 12 }}>→</span>
            <span style={{ flex: 1 }}>
              {displayName(to ?? { name: null, email: t.to })}
            </span>
            <span style={{ fontWeight: 600, color: "#e9e3d3" }}>{formatNok(t.amount)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function UtgifterClient({
  tripId,
  currentUserId,
  participants,
}: {
  tripId: string;
  currentUserId: string;
  participants: Participant[];
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [split, setSplit] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/trips/${tripId}/expenses`);
    if (!res.ok) return;
    const data = await res.json();
    setExpenses(data.expenses ?? []);
    setSplit(data.split ?? []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDelete(expenseId: string) {
    await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" });
    fetchData();
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Patch the AddExpenseForm's fetch URL using tripId
  const FormWithTripId = () => (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const desc = (form.elements.namedItem("description") as HTMLInputElement).value.trim();
        const amt = parseFloat(
          (form.elements.namedItem("amount") as HTMLInputElement).value.replace(",", "."),
        );
        const paidBy = (form.elements.namedItem("paidByUserId") as HTMLSelectElement).value;
        if (!desc || isNaN(amt) || amt <= 0) return;
        await fetch(`/api/trips/${tripId}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: desc, amount: amt, paidByUserId: paidBy }),
        });
        form.reset();
        (form.elements.namedItem("paidByUserId") as HTMLSelectElement).value = currentUserId;
        fetchData();
      }}
      style={{ display: "flex", flexDirection: "column", gap: 10 }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <input name="description" type="text" placeholder="Beskrivelse (f.eks. dagligvarer)" required style={inputStyle} />
        <input
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="Beløp kr"
          required
          style={{ ...inputStyle, width: 110, flexShrink: 0 }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ color: "rgba(233,227,211,.55)", fontSize: 13 }}>Betalt av:</label>
        <select
          name="paidByUserId"
          defaultValue={currentUserId}
          style={{ ...inputStyle, flex: 1, background: "rgba(10,15,28,.7)" }}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id} style={{ background: "#0a0f1c" }}>
              {displayName(p)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            background: "var(--moss, #4e7c5f)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Legg til
        </button>
      </div>
    </form>
  );

  return (
    <div style={{ padding: "24px 16px 100px", maxWidth: 540, margin: "0 auto" }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#e9e3d3",
          margin: "0 0 6px",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        Utgifter
      </h1>
      {total > 0 && (
        <p style={{ color: "rgba(233,227,211,.5)", fontSize: 13, margin: "0 0 20px" }}>
          Totalt: {formatNok(total)}
        </p>
      )}

      {/* Add expense form */}
      <section style={{ marginBottom: 28 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: ".12em",
            color: "rgba(233,227,211,.45)",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          Ny utgift
        </p>
        <FormWithTripId />
      </section>

      {/* Expense list */}
      {!loading && expenses.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: ".12em",
              color: "rgba(233,227,211,.45)",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            Registrerte utgifter
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "rgba(233,227,211,.06)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, color: "#e9e3d3", fontWeight: 500 }}>
                    {expense.description}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(233,227,211,.45)" }}>
                    Betalt av {displayName(expense.paidBy)}
                  </p>
                </div>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#e9e3d3", flexShrink: 0 }}>
                  {formatNok(expense.amount)}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  aria-label="Slett utgift"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(233,227,211,.35)",
                    cursor: "pointer",
                    padding: 4,
                    flexShrink: 0,
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Split result */}
      {!loading && (
        <section>
          <p
            style={{
              fontSize: 11,
              letterSpacing: ".12em",
              color: "rgba(233,227,211,.45)",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Splitt
          </p>
          <SplitSection
            split={split}
            participants={participants}
            currentUserId={currentUserId}
          />
        </section>
      )}
    </div>
  );
}
