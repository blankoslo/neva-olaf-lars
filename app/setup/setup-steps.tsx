import { CodeBlock } from "./code-block";

const headingStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontStyle: "italic",
  fontSize: 22,
  color: "var(--bone)",
  marginBottom: 12,
};
const bodyStyle: React.CSSProperties = {
  color: "var(--bone-2)",
  fontSize: 14,
  lineHeight: 1.55,
  marginBottom: 12,
};

export default function SetupSteps() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <section>
        <h2 style={{ ...headingStyle, fontSize: 26 }}>Kom i gang</h2>
        <p style={bodyStyle}>
          Følg desse stega for å sette opp Wilhelm — Next.js, Prisma og
          autentisering.
        </p>
      </section>

      <section>
        <h3 style={headingStyle}>1. Installer avhengnader</h3>
        <p style={bodyStyle}>
          Etter at du har klona repoet og navigert inn:
        </p>
        <CodeBlock code="pnpm install" />
      </section>

      <section>
        <h3 style={headingStyle}>2. Lag ein Prisma Postgres-instans</h3>
        <p style={bodyStyle}>Køyr følgjande for å initialisere databasen:</p>
        <CodeBlock code="npx prisma init --db" />
        <p style={bodyStyle}>Kommandoen er interaktiv og vil be deg om å:</p>
        <ol
          style={{
            listStyle: "decimal",
            paddingLeft: 20,
            color: "var(--bone-2)",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          <li>Logge på Prisma-konsollen</li>
          <li>
            Velje ein <strong>region</strong> for Prisma Postgres-instansen
          </li>
          <li>
            Gje eit <strong>namn</strong> til prosjektet
          </li>
        </ol>
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          Når kommandoen er ferdig, kopier <strong>Database URL</strong> frå
          terminalen — du treng den i neste steg.
        </p>
      </section>

      <section>
        <h3 style={headingStyle}>3. Sett opp .env-fila</h3>
        <p style={bodyStyle}>
          Lag ein <code>.env</code>-fil:
        </p>
        <CodeBlock code="touch .env" />
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          Oppdater <code>.env</code> med <code>DATABASE_URL</code> frå førre
          steg:
        </p>
        <CodeBlock
          code={`DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=PRISMA_POSTGRES_API_KEY"`}
        />
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          NextAuth.js krev òg ein hemmelegheit:
        </p>
        <CodeBlock code={`AUTH_SECRET="RANDOM_32_CHARACTER_STRING"`} />
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          Generer ei tilfeldig 32-teikns streng:
        </p>
        <CodeBlock code="npx auth secret" />
      </section>

      <section>
        <h3 style={headingStyle}>4. Migrer databasen</h3>
        <p style={bodyStyle}>Sett opp schemaet:</p>
        <CodeBlock code="npx prisma migrate dev --name init" />
      </section>

      <section>
        <h3 style={headingStyle}>5. Så frø</h3>
        <p style={bodyStyle}>Legg til opphavlege data:</p>
        <CodeBlock code="npx prisma db seed" />
      </section>

      <section>
        <h3 style={headingStyle}>6. Køyr appen</h3>
        <p style={bodyStyle}>Start utviklingstenaren:</p>
        <CodeBlock code="pnpm dev" />
        <p style={{ ...bodyStyle, marginTop: 12 }}>
          Opne <code>http://localhost:3000</code> for å møte Wilhelm.
        </p>
      </section>
    </div>
  );
}
