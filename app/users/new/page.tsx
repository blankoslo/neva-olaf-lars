export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Form from "next/form";
import { Stamp } from "../../_components/wilhelm";
import { Glyph } from "../../_components/glyph";
import TabBar from "../../_components/tabbar";

export default function NewUser() {
  async function createUser(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    await prisma.user.create({
      data: { name, email, password: "" },
    });

    redirect("/users");
  }

  return (
    <>
      <main style={{ paddingTop: 24 }}>
        <div style={{ padding: "16px 22px 0" }}>
          <div className="flex-row between center">
            <Link href="/users" className="pill" style={{ textDecoration: "none" }}>
              ← FØLGET
            </Link>
            <Stamp color="#5b6b5a" rotate={2}>· Nytt navn ·</Stamp>
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
            Legg til<br />
            <em>en turkamerat.</em>
          </h1>
        </div>

        <section
          style={{
            margin: "20px 18px",
            padding: 16,
            background: "#fff8ea",
            border: "1px solid rgba(26,31,26,.18)",
            borderRadius: 4,
            boxShadow: "0 2px 0 rgba(26,31,26,.10)",
          }}
        >
          <Form action={createUser}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="name" className="field-label">
                Navn
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Astrid Lien"
                className="field"
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="email" className="field-label">
                E-post · påkrevd
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="navn@domene.no"
                className="field"
              />
            </div>
            <button type="submit" className="btn-ember" style={{ width: "100%", marginTop: 6 }}>
              Legg til <Glyph name="arrow-r" size={16} color="#fff" />
            </button>
          </Form>
        </section>
      </main>
      <TabBar />
    </>
  );
}
