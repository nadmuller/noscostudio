export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--stone)",
        }}
      >
        Carregando...
      </p>
    </div>
  );
}
