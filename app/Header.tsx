"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="topstrip">
      <Link href="/" style={{ letterSpacing: ".22em" }}>
        WILHELM · TURKAMERAT
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {session ? (
          <>
            <span style={{ opacity: 0.7, textTransform: "none", letterSpacing: ".05em" }}>
              {session.user?.name || session.user?.email}
            </span>
            <Link href="/users" style={{ opacity: 0.7 }}>
              FØLGE
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              style={{
                background: "transparent",
                border: "1px solid rgba(26,31,26,0.4)",
                color: "inherit",
                fontFamily: "inherit",
                fontSize: 10,
                letterSpacing: ".18em",
                padding: "3px 8px",
                borderRadius: 99,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              Logg ut
            </button>
          </>
        ) : (
          <Link href="/login" style={{ opacity: 0.85 }}>
            LOGG INN
          </Link>
        )}
      </div>
    </header>
  );
}
