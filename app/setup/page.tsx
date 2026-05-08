import SetupInstructions from "./setup-instructions";

export default function SetupPage() {
  return (
    <main style={{ paddingTop: 24 }}>
      <div className="page-pad">
        <div
          className="eyebrow muted"
          style={{ fontSize: 9 }}
        >
          ANNO · OPPSETT
        </div>
        <h1
          className="display italic"
          style={{ fontSize: 36, marginTop: 12, lineHeight: 1 }}
        >
          Velkomen til Wilhelm.
        </h1>
        <p
          className="serif"
          style={{
            color: "var(--bone-2)",
            marginTop: 12,
            fontSize: 16,
            fontStyle: "italic",
          }}
        >
          «Set deg ned. Først må vi få databasen til å vakne.»
        </p>
      </div>

      <div
        className="mx-frame panel"
        style={{
          marginTop: 22,
          marginBottom: 32,
          padding: 24,
          color: "var(--bone)",
        }}
      >
        <SetupInstructions />
      </div>
    </main>
  );
}
