"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ServiceResult, ServiceStatus, StatusResponse } from "../api/status/route";

const STATUS_COLOR: Record<ServiceStatus, string> = {
  ok: "var(--moss)",
  degraded: "var(--ember)",
  down: "#c14a3f",
};

const STATUS_BG: Record<ServiceStatus, string> = {
  ok: "rgba(163,196,160,0.10)",
  degraded: "rgba(244,162,89,0.10)",
  down: "rgba(193,74,63,0.12)",
};

const STATUS_LABEL: Record<ServiceStatus, string> = {
  ok: "OK",
  degraded: "TREG",
  down: "NEDE",
};

const OVERALL_MSG: Record<ServiceStatus, string> = {
  ok: "Alle tjenester operative.",
  degraded: "Noen tjenester er trege.",
  down: "En eller flere tjenester er nede.",
};

function StatusDot({ status }: { status: ServiceStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: status === "ok" ? `0 0 6px ${color}` : undefined,
        flexShrink: 0,
      }}
    />
  );
}

function ServiceRow({ svc }: { svc: ServiceResult }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 0",
        borderBottom: "1px dashed rgba(233,227,211,0.08)",
      }}
    >
      <div style={{ marginTop: 5 }}>
        <StatusDot status={svc.status} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, color: "var(--bone)", fontWeight: 500 }}>{svc.name}</span>
          <span
            className="mono"
            style={{
              fontSize: 8,
              letterSpacing: ".18em",
              padding: "2px 6px",
              borderRadius: 2,
              background: STATUS_BG[svc.status],
              color: STATUS_COLOR[svc.status],
              border: `1px solid ${STATUS_COLOR[svc.status]}44`,
            }}
          >
            {STATUS_LABEL[svc.status]}
          </span>
          {svc.latencyMs !== null && svc.status !== "down" && (
            <span className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: ".12em" }}>
              {svc.latencyMs} ms
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--slate)", marginTop: 3 }}>{svc.description}</div>
        {svc.url !== "intern" && (
          <div className="mono" style={{ fontSize: 9, color: "var(--slate-2)", marginTop: 2, letterSpacing: ".08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {svc.url}
          </div>
        )}
        {svc.detail && (
          <div
            style={{
              marginTop: 6,
              padding: "6px 10px",
              borderRadius: 4,
              background: "rgba(193,74,63,0.08)",
              border: "1px solid rgba(193,74,63,0.20)",
              fontSize: 11,
              color: "#c14a3f",
              fontFamily: "'DM Mono', monospace",
              letterSpacing: ".04em",
              wordBreak: "break-word",
            }}
          >
            {svc.detail}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const overall = data?.overall ?? "ok";
  const checkedAt = data?.checkedAt ? new Date(data.checkedAt) : null;

  return (
    <main style={{ paddingTop: 24, paddingBottom: 60 }}>
      <div className="page-pad">
        <Link href="/" className="pill" style={{ textDecoration: "none" }}>
          ← TILBAKE
        </Link>

        <h1
          style={{
            marginTop: 18,
            fontSize: 34,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontWeight: 400,
          }}
        >
          Systemstatus
        </h1>

        {/* Overall banner */}
        <div
          style={{
            marginTop: 20,
            padding: "14px 16px",
            borderRadius: 8,
            border: `1px solid ${loading ? "rgba(233,227,211,0.12)" : STATUS_COLOR[overall] + "44"}`,
            background: loading ? "rgba(233,227,211,0.04)" : STATUS_BG[overall],
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {loading ? (
            <span className="mono" style={{ fontSize: 10, color: "var(--slate)", letterSpacing: ".18em" }}>
              SJEKKER TJENESTER…
            </span>
          ) : error ? (
            <span className="mono" style={{ fontSize: 10, color: "#c14a3f", letterSpacing: ".18em" }}>
              KLARTE IKKE Å HENTE STATUS
            </span>
          ) : (
            <>
              <StatusDot status={overall} />
              <span
                className="mono"
                style={{ fontSize: 10, letterSpacing: ".18em", color: STATUS_COLOR[overall] }}
              >
                {OVERALL_MSG[overall]}
              </span>
            </>
          )}
        </div>

        {/* Last checked + refresh */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div className="mono" style={{ fontSize: 9, color: "var(--slate)", letterSpacing: ".14em" }}>
            {checkedAt
              ? `SJEKKET ${checkedAt.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : "\u00a0"}
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: 999,
              cursor: loading ? "default" : "pointer",
              border: "1px solid rgba(233,227,211,0.20)",
              background: "transparent",
              color: loading ? "var(--slate)" : "var(--bone-2)",
              transition: "opacity .12s",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Laster…" : "Oppdater"}
          </button>
        </div>

        {/* Service list */}
        {data && (
          <section style={{ marginTop: 24 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.5, marginBottom: 4 }}>
              ─── TJENESTER
            </div>
            {data.services.map((svc) => (
              <ServiceRow key={svc.id} svc={svc} />
            ))}
          </section>
        )}

        {/* Legend */}
        <section style={{ marginTop: 32 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.5, marginBottom: 10 }}>
            ─── FORKLARING
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {(["ok", "degraded", "down"] as ServiceStatus[]).map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <StatusDot status={s} />
                <span className="mono" style={{ fontSize: 9, letterSpacing: ".14em", color: STATUS_COLOR[s] }}>
                  {STATUS_LABEL[s]}
                </span>
                <span style={{ fontSize: 11, color: "var(--slate)" }}>
                  {s === "ok" && "— Fungerer normalt"}
                  {s === "degraded" && "— Svarer, men tregt (>3 s)"}
                  {s === "down" && "— Svarer ikke"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
