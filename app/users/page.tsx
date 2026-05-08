export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Stamp } from "../_components/wilhelm";
import TabBar from "../_components/tabbar";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="flex-row between center">
            <Link href="/" className="pill" style={{ textDecoration: "none" }}>
              ← TILBAKE
            </Link>
            <Stamp color="var(--moss)" rotate={-2}>· Turfølge ·</Stamp>
          </div>
          <h1
            style={{
              marginTop: 18,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            Følget<br />
            <em>på turen.</em>
          </h1>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6, marginTop: 8 }}
          >
            {users.length} REGISTRERT
          </div>
        </div>

        <section className="page-pad">
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.6 }}>
            ─── NAVN OG VEI
          </div>
          <ul className="split-list">
            {users.map((u) => (
              <li
                key={u.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 0",
                  borderBottom: "1px dashed rgba(233,227,211,0.10)",
                }}
              >
                <span style={{ fontSize: 17, lineHeight: 1.15 }}>{u.name || "Uten navn"}</span>
                <span
                  className="mono"
                  style={{ fontSize: 11, letterSpacing: ".08em", opacity: 0.6, marginTop: 2 }}
                >
                  {u.email}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="page-pad" style={{ paddingBottom: 24 }}>
          <Link href="/users/new" className="btn-ember" style={{ width: "100%" }}>
            Legg til en turkamerat
          </Link>
        </div>
      </main>
      <TabBar />
    </>
  );
}
