"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileDropdown } from "./ProfileDropdown";
import { ProjectCard, NewProjectCard } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import type { Project } from "@/lib/types";

interface ProjectsHomeProps {
  projects: (Project & { task_count: number })[];
  userEmail: string;
}

export function ProjectsHome({
  projects: initialProjects,
  userEmail,
}: ProjectsHomeProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const handleCreated = (project: Project) => {
    setProjects((prev) => [...prev, { ...project, task_count: 0 }]);
    setShowCreate(false);
    router.push(`/project/${project.slug}`);
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <span style={logoStyle}>Nosco Studio</span>
        <ProfileDropdown email={userEmail} />
      </header>

      {/* Content */}
      <main style={mainStyle}>
        <div style={titleBlockStyle}>
          <h1 style={titleStyle}>Seus projetos</h1>
          <p style={subtitleStyle}>
            {projects.length}{" "}
            {projects.length === 1 ? "projeto" : "projetos"}
          </p>
        </div>

        <div style={gridStyle}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} taskCount={p.task_count} />
          ))}
          <NewProjectCard onClick={() => setShowCreate(true)} />
        </div>
      </main>

      {showCreate && (
        <CreateProjectModal
          ownerEmail={userEmail}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--cream)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 40px",
  height: 52,
  borderBottom: "1px solid var(--sand)",
};

const logoStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "var(--dark)",
};

const mainStyle: React.CSSProperties = {
  padding: "48px 40px",
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
