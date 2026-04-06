"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import { TaskTable } from "@/modules/tasks/components/TaskTable";
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
  const [panelName, setPanelName] = useState(panel.name);
  const [editingName, setEditingName] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Merge allGroups from tasks + groups already in the filter (even if no tasks exist yet)
  const availableGroups = [
    ...new Set([...allGroups, ...activeFilters]),
  ].sort();

  const handleCreated = (timeline: Timeline) => {
    setShowCreate(false);
    router.push(`/project/${projectSlug}/timeline/${timeline.slug}`);
  };

  const persistFilters = async (newFilters: string[]) => {
    const supabase = createClient();
    await supabase
      .from("panels")
      .update({
        filters: { group_names: newFilters.length > 0 ? newFilters : undefined },
        updated_at: new Date().toISOString(),
      })
      .eq("id", panel.id);
  };

  const toggleFilter = async (group: string) => {
    const newFilters = activeFilters.includes(group)
      ? activeFilters.filter((g) => g !== group)
      : [...activeFilters, group];

    setActiveFilters(newFilters);
    await persistFilters(newFilters);
    router.refresh();
  };

  const addGroup = async () => {
    const name = newGroup.trim().toUpperCase();
    if (!name || activeFilters.includes(name)) {
      setNewGroup("");
      return;
    }
    const newFilters = [...activeFilters, name];
    setActiveFilters(newFilters);
    setNewGroup("");
    await persistFilters(newFilters);
    router.refresh();
  };

  const saveName = async () => {
    const trimmed = panelName.trim();
    if (!trimmed || trimmed === panel.name) {
      setPanelName(panel.name);
      setEditingName(false);
      return;
    }
    const supabase = createClient();
    const newSlug = generateSlug(trimmed);
    await supabase
      .from("panels")
      .update({
        name: trimmed,
        slug: newSlug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", panel.id);

    setEditingName(false);
    // Navigate to new slug
    router.push(`/project/${projectSlug}/panel/${newSlug}`);
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
        <div style={filterAreaStyle}>
          {/* Editable panel name */}
          <div style={nameRowStyle}>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setPanelName(panel.name);
                    setEditingName(false);
                  }
                }}
                style={nameInputStyle}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                style={nameDisplayStyle}
                title="Clique para editar o nome"
              >
                {panelName}
                <span style={editIconStyle}>✎</span>
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div style={filterBarStyle}>
            <span style={filterLabelStyle}>Filtrar:</span>
            {availableGroups.map((g) => (
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
            {/* Add new group input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addGroup();
              }}
              style={addGroupFormStyle}
            >
              <input
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                placeholder="+ adicionar grupo"
                style={addGroupInputStyle}
              />
            </form>
          </div>
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
  alignItems: "flex-start",
  padding: "16px 40px 0",
  gap: 16,
};

const filterAreaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const nameRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const nameDisplayStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "none",
  border: "none",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
  cursor: "pointer",
  padding: 0,
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const editIconStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--stone)",
  opacity: 0.4,
};

const nameInputStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--dark)",
  border: "none",
  borderBottom: "1px solid var(--sand)",
  background: "transparent",
  padding: "2px 0",
  outline: "none",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  minWidth: 200,
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

const addGroupFormStyle: React.CSSProperties = {
  display: "inline-flex",
};

const addGroupInputStyle: React.CSSProperties = {
  padding: "4px 10px",
  border: "1px dashed var(--sand)",
  borderRadius: 20,
  background: "transparent",
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--stone)",
  outline: "none",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  width: 130,
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
