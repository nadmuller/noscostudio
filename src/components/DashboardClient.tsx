"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskTable } from "./TaskTable";
import { CreateTimelineModal } from "./CreateTimelineModal";
import { CreatePanelModal } from "./CreatePanelModal";
import type { Task, Timeline, Panel } from "@/lib/types";

interface DashboardClientProps {
  tasks: Task[];
  existingGroups: string[];
  userEmail: string;
  projectId: string;
  projectSlug: string;
}

export function DashboardClient({
  tasks,
  existingGroups,
  userEmail,
  projectId,
  projectSlug,
}: DashboardClientProps) {
  const [showCreateTimeline, setShowCreateTimeline] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const router = useRouter();

  const handleTimelineCreated = (timeline: Timeline) => {
    setShowCreateTimeline(false);
    router.push(`/project/${projectSlug}/timeline/${timeline.slug}`);
  };

  const handlePanelCreated = (panel: Panel) => {
    setShowCreatePanel(false);
    router.push(`/project/${projectSlug}/panel/${panel.slug}`);
  };

  return (
    <>
      <div style={topBarStyle}>
        <div />
        <div style={btnGroupStyle}>
          <button onClick={() => setShowCreatePanel(true)} style={newTlBtnStyle}>
            + Novo Painel
          </button>
          <button onClick={() => setShowCreateTimeline(true)} style={newTlBtnStyle}>
            + Nova Timeline
          </button>
        </div>
      </div>
      <TaskTable tasks={tasks} projectId={projectId} />
      {showCreateTimeline && (
        <CreateTimelineModal
          existingGroups={existingGroups}
          ownerEmail={userEmail}
          projectId={projectId}
          onCreated={handleTimelineCreated}
          onClose={() => setShowCreateTimeline(false)}
        />
      )}
      {showCreatePanel && (
        <CreatePanelModal
          existingGroups={existingGroups}
          ownerEmail={userEmail}
          projectId={projectId}
          onCreated={handlePanelCreated}
          onClose={() => setShowCreatePanel(false)}
        />
      )}
    </>
  );
}

const topBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  padding: "12px 40px 0",
};

const btnGroupStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
};

const newTlBtnStyle: React.CSSProperties = {
  padding: "6px 16px",
  background: "transparent",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "all 0.15s ease",
};
