"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TaskTable } from "./TaskTable";
import { CreateTimelineModal } from "./CreateTimelineModal";
import type { Task, Timeline, Panel } from "@/lib/types";

interface PanelClientProps {
  tasks: Task[];
  existingGroups: string[];
  allGroups: string[];
  userEmail: string;
  projectId: string;
  projectSlug: string;
  panel: Panel;
}

export function PanelClient({
  tasks,
  existingGroups,
  allGroups,
  userEmail,
  projectId,
  projectSlug,
  panel,
}: PanelClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(
    panel.filters.group_names || []
  );
  const router = useRouter();

  const handleCreated = (timeline: Timeline) => {
    setShowCreate(false);
    router.push(`/project/${projectSlug}/timeline/${timeline.slug}`);
  };

  const toggleFilter = async (group: string) => {
    const newFilters = activeFilters.includes(group)
      ? activeFilters.filter((g) => g !== group)
      : [...activeFilters, group];

    setActiveFilters(newFilters);

    // Persist filter change
    const supabase = createClient();
    await supabase
      .from("panels")
      .update({
        filters: { group_names: newFilters.length > 0 ? newFilters : undefined },
        updated_at: new Date().toISOString(),
      })
      .eq("id", panel.id);

    router.refresh();
  };

  // Filter tasks client-side based on active filters
  const filteredTasks =
    activeFilters.length > 0
      ? tasks.filter((t) => activeFilters.includes(t.group_name))
      : tasks;

  return (
    <>
      <div style={topBarStyle}>
        <div style={filterBarStyle}>
          <span style={filterLabelStyle}>Filtrar:</span>
          {allGroups.map((g) => (
            <button
              key={g}
              onClick={() => toggleFilter(g)}
              style={{
                ...chipStyle,
                ...(activeFilters.includes(g) ? chipActiveStyle : {}),
              }}
            >
              {g}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(true)} style={newTlBtnStyle}>
          + Nova Timeline
        </button>
      </div>
      <TaskTable
        tasks={filteredTasks}
        projectId={projectId}
        panelGroupFilter={activeFilters.length > 0 ? activeFilters : undefined}
      />
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

const topBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 40px 0",
  gap: 16,
};

const filterBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "wrap",
};

const filterLabelStyle: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--stone)",
  marginRight: 4,
};

const chipStyle: React.CSSProperties = {
  padding: "4px 10px",
  border: "1px solid var(--sand)",
  borderRadius: 20,
  background: "transparent",
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--stone)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const chipActiveStyle: React.CSSProperties = {
  background: "var(--dark)",
  color: "var(--cream)",
  borderColor: "var(--dark)",
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
  whiteSpace: "nowrap",
};
