export default function Loading() {
  return (
    <div
      style={{
        padding: "32px 40px",
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
