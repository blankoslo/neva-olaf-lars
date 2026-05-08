import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import TabBar from "../_components/tabbar";
import { WilhelmAvatar } from "../_components/wilhelm";
import { Glyph } from "../_components/glyph";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div className="page-pad">
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", opacity: 0.55 }}>
            PROFIL
          </div>
          <h1
            style={{
              marginTop: 12,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}
          >
            {user ? "Din " : "Logg "}<em>{user ? "konto." : "inn."}</em>
          </h1>
        </div>

        {user ? (
          <section
            className="mx-frame"
            style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(233,227,211,0.04)",
              border: "1px solid rgba(233,227,211,0.10)",
              borderRadius: 4,
            }}
          >
            <div className="flex-row gap-3 center" style={{ marginBottom: 14 }}>
              <WilhelmAvatar size={44} variant="ink" />
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
                  INNLOGGET SOM
                </div>
                <p
                  className="serif"
                  style={{
                    fontSize: 18,
                    color: "var(--bone)",
                    margin: "2px 0 0",
                    lineHeight: 1.2,
                  }}
                >
                  {user.name || user.email}
                </p>
                {user.name && user.email && (
                  <div className="mono" style={{ fontSize: 10, color: "var(--slate)", marginTop: 2 }}>
                    {user.email}
                  </div>
                )}
              </div>
            </div>
            <LogoutButton />
          </section>
        ) : (
          <section
            className="mx-frame"
            style={{
              marginTop: 20,
              padding: 16,
              background: "rgba(233,227,211,0.04)",
              border: "1px solid rgba(233,227,211,0.10)",
              borderRadius: 4,
            }}
          >
            <div className="flex-row gap-3 center" style={{ marginBottom: 14 }}>
              <WilhelmAvatar size={44} variant="ink" />
              <div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", opacity: 0.6 }}>
                  WILHELM · DØRA
                </div>
                <p
                  className="serif italic"
                  style={{
                    fontSize: 16,
                    color: "var(--bone-2)",
                    margin: "2px 0 0",
                    lineHeight: 1.2,
                  }}
                >
                  Kom inn — kaffen er nettopp satt på.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="btn-ember"
              style={{ width: "100%", marginTop: 6, textDecoration: "none" }}
            >
              Logg inn <Glyph name="arrow-r" size={16} color="#fff" />
            </Link>
            <div style={{ padding: "18px 0 0", textAlign: "center" }}>
              <Link
                href="/register"
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--ember)",
                  textDecoration: "none",
                }}
              >
                Ingen konto? Registrer deg →
              </Link>
            </div>
          </section>
        )}

        <div style={{ height: 80 }} />
      </main>
      <TabBar />
    </>
  );
}
