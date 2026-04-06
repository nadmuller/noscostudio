"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import { Timeline } from "./Timeline";
import { ShareToggle } from "./ShareToggle";
import type { Task, Timeline as TimelineType, TimelineFilters } from "@/lib/types";

interface TimelineViewProps {
  timeline: TimelineType;
  tasks: Task[];
  projectSlug?: string;
  allGroups?: string[];
}

export function TimelineView({ timeline, tasks, projectSlug, allGroups = [] }: TimelineViewProps) {
  const router = useRouter();
  const [tlName, setTlName] = useState(timeline.name);
  const [editingName, setEditingName] = useState(false);
  const [activeGroups, setActiveGroups] = useState<string[]>(
    timeline.filters.group_names || []
  );
  const [newGroup, setNewGroup] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Merge all groups from tasks + groups already in the filter
  const availableGroups = [
    ...new Set([...allGroups, ...activeGroups]),
  ].sort();

  const handleDeleteTimeline = async () => {
    if (!confirm(`Excluir a timeline "${timeline.name}"? Esta ação não pode ser desfeita.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("timelines").delete().eq("id", timeline.id);
    if (!error) {
      const dest = projectSlug ? `/project/${projectSlug}` : "/";
      router.push(dest);
    }
  };

  const saveName = async () => {
    const trimmed = tlName.trim();
    if (!trimmed || trimmed === timeline.name) {
      setTlName(timeline.name);
      setEditingName(false);
      return;
    }
    const supabase = createClient();
    const newSlug = generateSlug(trimmed);
    await supabase
      .from("timelines")
      .update({
        name: trimmed,
        slug: newSlug,
        updated_at: new Date().toISOString(),
      })
      .eq("id", timeline.id);

    setEditingName(false);
    if (projectSlug) {
      router.push(`/project/${projectSlug}/timeline/${newSlug}`);
    }
    router.refresh();
  };

  const persistFilters = async (newGroups: string[]) => {
    const supabase = createClient();
    const updatedFilters: TimelineFilters = {
      ...timeline.filters,
      group_names: newGroups.length > 0 ? newGroups : undefined,
    };
    await supabase
      .from("timelines")
      .update({
        filters: updatedFilters,
        updated_at: new Date().toISOString(),
      })
      .eq("id", timeline.id);
  };

  const toggleGroup = async (group: string) => {
    const newGroups = activeGroups.includes(group)
      ? activeGroups.filter((g) => g !== group)
      : [...activeGroups, group];

    setActiveGroups(newGroups);
    await persistFilters(newGroups);
    router.refresh();
  };

  const addGroup = async () => {
    const name = newGroup.trim().toUpperCase();
    if (!name || activeGroups.includes(name)) {
      setNewGroup("");
      return;
    }
    const newGroups = [...activeGroups, name];
    setActiveGroups(newGroups);
    setNewGroup("");
    await persistFilters(newGroups);
    router.refresh();
  };

  const deleteBtn = (
    <button onClick={handleDeleteTimeline} style={deleteBtnStyle} title="Excluir timeline">
      Excluir
    </button>
  );

  const editableHeader = (
    <div style={editAreaStyle}>
      {/* Editable name */}
      <div style={nameRowStyle}>
        {editingName ? (
          <input
            ref={nameInputRef}
            value={tlName}
            onChange={(e) => setTlName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName();
              if (e.key === "Escape") {
                setTlName(timeline.name);
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
            {tlName}
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
            onClick={() => toggleGroup(g)}
            style={{
              ...chipStyle,
              ...(activeGroups.includes(g) ? chipActiveStyle : {}),
            }}
          >
            {g}
          </button>
        ))}
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
  );

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", overflowY: "auto" }}>
      {editableHeader}
      <Timeline
        tasks={tasks}
        timelineName={tlName}
        projectId={timeline.project_id}
        shareToggle={<ShareToggle timeline={timeline} />}
        extraHeaderRight={deleteBtn}
      />
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────

const editAreaStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "16px 40px 0",
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

const deleteBtnStyle: React.CSSProperties = {
  padding: "5px 14px",
  background: "transparent",
  border: "1px solid #e8c4c0",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#c0392b",
  cursor: "pointer",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  transition: "all 0.15s ease",
};
