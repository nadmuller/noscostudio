"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  taskCount: number;
}

export function ProjectCard({ project, taskCount }: ProjectCardProps) {
  const created = project.created_at
    ? new Date(project.created_at).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link href={`/project/${project.slug}`} style={cardStyle}>
      <div style={cardInner}>
        <div style={nameStyle}>{project.name}</div>
        <div style={metaStyle}>
          {taskCount} {taskCount === 1 ? "tarefa" : "tarefas"}
        </div>
        {created && <div style={dateStyle}>{created}</div>}
      </div>
    </Link>
  );
}

export function NewProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={newCardStyle}>
      <div style={plusStyle}>+</div>
      <div style={newLabelStyle}>Novo projeto</div>
    </button>
  );
}

// ── Styles ──────────────────────────────────────────────

const cardBase: React.CSSProperties = {
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

const cardStyle: React.CSSProperties = {
  ...cardBase,
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

const dateStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.06em",
  color: "var(--sand)",
  textTransform: "capitalize",
  marginTop: 2,
};

const newCardStyle: React.CSSProperties = {
  ...cardBase,
  border: "1.5px dashed var(--sand)",
  background: "transparent",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

const plusStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 300,
  color: "var(--stone)",
  lineHeight: 1,
};

const newLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
};
