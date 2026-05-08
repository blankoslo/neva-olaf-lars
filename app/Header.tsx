"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="topstrip">
      <Link href="/" style={{ letterSpacing: "0.24em", color: "var(--ember)" }}>
        WILHELM · TYSKEBERGE
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {session ? (
          <>
            <span
              style={{
                opacity: 0.65,
                textTransform: "none",
                letterSpacing: "0.04em",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
              }}
            >
              {session.user?.name || session.user?.email}
            </span>
            <Link href="/users">FØLGE</Link>
            <button
              type="button"
              onClick={() => signOut()}
              style={{
                background: "transparent",
                border: "1px solid rgba(233,227,211,0.30)",
                color: "var(--bone-2)",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: "0.2em",
                padding: "4px 10px",
                borderRadius: 999,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Logg ut
            </button>
          </>
        ) : (
          <Link href="/login">LOGG INN</Link>
        )}
      </div>
    </header>
  );
}
