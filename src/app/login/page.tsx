import { LoginButton } from "@/components/LoginButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f2f3",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        gap: 32,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#22221e",
            marginBottom: 8,
          }}
        >
          Nosco Studio
        </h1>
        <p
          style={{
            fontSize: 10,
            fontWeight: 300,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#a19891",
          }}
        >
          Gestão de Projetos
        </p>
      </div>

      <LoginButton />

      <LoginError searchParams={searchParams} />
    </div>
  );
}

async function LoginError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  if (params.error === "unauthorized") {
    return (
      <p
        style={{
          fontSize: 11,
          color: "#c0392b",
          letterSpacing: "0.1em",
        }}
      >
        Acesso nao autorizado. Entre em contato com o administrador.
      </p>
    );
  }
  return null;
}
