import { notFound } from "next/navigation";
import Link from "next/link";
import TabBar from "../../../_components/tabbar";
import prisma from "../../../../lib/prisma";
import InviteButton from "./InviteButton";

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "Blir med",
  PENDING: "Invitert",
  DECLINED: "Takket nei",
};

export default async function DeltakerePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      title: true,
      inviteCode: true,
      participants: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!trip) notFound();

  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_BASE_URL ??
    "http://localhost:3000";
  const inviteUrl = `${baseUrl}/bli-med/${trip.inviteCode}`;

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <Link href={`/tur/${id}`} className="pill" style={{ textDecoration: "none" }}>
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
            Turfølget
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            {trip.participants.length} DELTAKER{trip.participants.length !== 1 ? "E" : ""}
          </div>
        </div>

        <section className="page-pad" style={{ marginTop: 8 }}>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginBottom: 8 }}
          >
            ─── NAVN OG STATUS
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {trip.participants.map(({ user, status }) => (
              <li
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px dashed rgba(233,227,211,0.10)",
                }}
              >
                <div>
                  <div style={{ fontSize: 17, lineHeight: 1.15 }}>
                    {user.name || "Uten navn"}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 11, letterSpacing: ".08em", opacity: 0.6, marginTop: 2 }}
                  >
                    {user.email}
                  </div>
                </div>
                <span
                  className="mono"
                  style={{
                    fontSize: 9,
                    letterSpacing: ".14em",
                    padding: "3px 10px",
                    borderRadius: 999,
                    background:
                      status === "ACCEPTED"
                        ? "rgba(163,196,160,.14)"
                        : status === "DECLINED"
                        ? "rgba(193,74,63,.14)"
                        : "rgba(233,227,211,.07)",
                    color:
                      status === "ACCEPTED"
                        ? "var(--moss)"
                        : status === "DECLINED"
                        ? "var(--ember-2)"
                        : "var(--slate)",
                  }}
                >
                  {STATUS_LABEL[status] ?? status}
                </span>
              </li>
            ))}
            {trip.participants.length === 0 && (
              <li
                className="mono"
                style={{
                  fontSize: 11,
                  color: "var(--slate)",
                  textAlign: "center",
                  padding: "24px 0",
                  letterSpacing: ".14em",
                }}
              >
                INGEN DELTAKERE ENNÅ
              </li>
            )}
          </ul>
        </section>

        <div className="page-pad" style={{ marginTop: 24, paddingBottom: 24 }}>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: ".14em",
              opacity: 0.5,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            DEL LENKEN FOR Å INVITERE ANDRE
          </div>
          <InviteButton inviteUrl={inviteUrl} />
        </div>

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}
