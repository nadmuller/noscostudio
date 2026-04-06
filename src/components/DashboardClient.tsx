"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskTable } from "@/modules/tasks/components/TaskTable";
import { CreateTimelineModal } from "./CreateTimelineModal";
import type { Task, Timeline } from "@/lib/types";

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
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const handleCreated = (timeline: Timeline) => {
    setShowCreate(false);
    router.push(`/project/${projectSlug}/timeline/${timeline.slug}`);
  };

  const extraButton = (
    <button onClick={() => setShowCreate(true)} style={newTlBtnStyle}>
      + Nova Timeline
    </button>
  );

  return (
    <>
      <TaskTable tasks={tasks} projectId={projectId} extraHeaderButton={extraButton} />
      {showCreate && (
        <CreateTimelineModal
          existingGroups={existingGroups}
          ownerEmail={userEmail}
          projectId={projectId}
          onCreated={handleCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  );
}

const newTlBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  background: "transparent",
  border: "1px solid var(--sand)",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--stone)",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "all 0.15s ease",
};
