export default function TimelineLoading() {
  return (
    <div style={containerStyle}>
      <div style={pulseStyle} />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "calc(100vh - 52px)",
  background: "var(--cream)",
};

const pulseStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "var(--stone)",
  animation: "pulse 1.2s ease-in-out infinite",
};
