"use client";

import Link from "next/link";

interface ProjectModulesProps {
  projectName: string;
  projectSlug: string;
  taskCount: number;
}

export function ProjectModules({ projectName, projectSlug, taskCount }: ProjectModulesProps) {
  const base = `/project/${projectSlug}`;

  const modules = [
    {
      name: "Cronograma",
      href: `${base}/cronograma`,
      description: `${taskCount} ${taskCount === 1 ? "tarefa" : "tarefas"}`,
    },
    {
      name: "Orçamento",
      href: `${base}/orcamento`,
      description: "Itens e custos",
    },
  ];

  return (
    <main style={mainStyle}>
      <div style={titleBlockStyle}>
        <h1 style={titleStyle}>{projectName}</h1>
        <p style={subtitleStyle}>{modules.length} módulos</p>
      </div>

      <div style={gridStyle}>
        {modules.map((mod) => (
          <Link key={mod.name} href={mod.href} style={cardStyle}>
            <div style={cardInner}>
              <div style={nameStyle}>{mod.name}</div>
              <div style={metaStyle}>{mod.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

// ── Styles ──────────────────────────────────────────────

const mainStyle: React.CSSProperties = {
  padding: "48px 40px",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const titleBlockStyle: React.CSSProperties = {
  marginBottom: 36,
};

const titleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  marginTop: 4,
};

const gridStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 20,
};

const cardStyle: React.CSSProperties = {
  width: 220,
  height: 160,
  borderRadius: 10,
  border: "1px solid var(--sand)",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  padding: "24px 24px",
  textDecoration: "none",
  transition: "all 0.2s ease",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const cardInner: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const nameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const metaStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--stone)",
};
