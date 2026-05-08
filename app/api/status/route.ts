import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type ServiceStatus = "ok" | "degraded" | "down";

export type ServiceResult = {
  id: string;
  name: string;
  description: string;
  url: string;
  status: ServiceStatus;
  latencyMs: number | null;
  detail: string | null;
};

export type StatusResponse = {
  overall: ServiceStatus;
  checkedAt: string;
  services: ServiceResult[];
};

async function check(
  fn: () => Promise<void>,
): Promise<{ status: ServiceStatus; latencyMs: number; detail: string | null }> {
  const t0 = Date.now();
  try {
    await fn();
    const latencyMs = Date.now() - t0;
    return {
      status: latencyMs > 3000 ? "degraded" : "ok",
      latencyMs,
      detail: null,
    };
  } catch (err) {
    return {
      status: "down",
      latencyMs: Date.now() - t0,
      detail: err instanceof Error ? err.message.slice(0, 140) : String(err).slice(0, 140),
    };
  }
}

async function checkHutsApi() {
  const res = await fetch(
    "https://ut-backend-api-2-41145913385.europe-north1.run.app/internal/graphql",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.data && !json?.__typename) throw new Error("Uventet svar-format");
}

async function checkUtNoApi() {
  const res = await fetch("https://api.ut.no/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Friluftskompis/1.0 status-check",
    },
    body: JSON.stringify({ query: "{ __typename }" }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function checkAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY ikke satt");
  const res = await fetch("https://api.anthropic.com/v1/models", {
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function checkKartverket() {
  const res = await fetch(
    "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/6/33/34.png",
    {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function checkGeonorge() {
  const res = await fetch(
    "https://ws.geonorge.no/stedsnavn/v1/sted?sok=Oslo&treffPerSide=1&utkoordsys=4258",
    { signal: AbortSignal.timeout(5000) },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json?.navn)) throw new Error("Uventet svar-format");
}

async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}

export async function GET() {
  const [huts, utno, anthropic, kartverket, geonorge, db] = await Promise.all([
    check(checkHutsApi),
    check(checkUtNoApi),
    check(checkAnthropic),
    check(checkKartverket),
    check(checkGeonorge),
    check(checkDatabase),
  ]);

  const services: ServiceResult[] = [
    {
      id: "db",
      name: "Database",
      description: "Lokal database for turer, brukere og chathistorikk",
      url: "intern",
      ...db,
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      description: "AI-chat (Wilhelm) og turforslag",
      url: "https://api.anthropic.com",
      ...anthropic,
    },
    {
      id: "huts",
      name: "DNT Hytter",
      description: "Hyttedata via UT-backend GraphQL",
      url: "https://ut-backend-api-2-41145913385.europe-north1.run.app",
      ...huts,
    },
    {
      id: "utno",
      name: "UT.no Ruter",
      description: "Rutedata og ruteforslag via UT.no GraphQL",
      url: "https://api.ut.no",
      ...utno,
    },
    {
      id: "kartverket",
      name: "Kartverket WMTS",
      description: "Topografiske kartfliser (topo + raster)",
      url: "https://cache.kartverket.no",
      ...kartverket,
    },
    {
      id: "geonorge",
      name: "Geonorge Stedsnavn",
      description: "Stedsnavnsøk i kartet",
      url: "https://ws.geonorge.no",
      ...geonorge,
    },
  ];

  const allOk = services.every((s) => s.status === "ok");
  const anyDown = services.some((s) => s.status === "down");
  const overall: ServiceStatus = anyDown ? "down" : allOk ? "ok" : "degraded";

  return NextResponse.json({
    overall,
    checkedAt: new Date().toISOString(),
    services,
  } satisfies StatusResponse);
}
