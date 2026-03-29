export default function TimelineLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 52px)",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 300,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--stone)",
        }}
      >
        Carregando...
      </div>
    </div>
  );
}
