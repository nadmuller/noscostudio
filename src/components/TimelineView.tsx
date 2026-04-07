"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/timelines";
import { Timeline } from "./Timeline";
import { ShareToggle } from "./ShareToggle";
import type { Task, Timeline as TimelineType, TimelineFilters } from "@/lib/types";
import "@/styles/timeline.css";

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
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const filterPopupRef = useRef<HTMLDivElement>(null);

  // Merge all groups from tasks + groups already in the filter
  const availableGroups = [
    ...new Set([...allGroups, ...activeGroups]),
  ].sort();

  // Close popup on click outside
  useEffect(() => {
    if (!showFilterPopup) return;
    const handler = (e: MouseEvent) => {
      if (filterPopupRef.current && !filterPopupRef.current.contains(e.target as Node)) {
        setShowFilterPopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilterPopup]);

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
    <div className="tl-edit-area">
      {/* Editable name */}
      <div className="tl-edit-name-row">
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
            className="tl-edit-name-input"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="tl-edit-name-btn"
            title="Clique para editar o nome"
          >
            {tlName}
            <span className="tl-edit-icon">✎</span>
          </button>
        )}
      </div>

      {/* Filter bar: active badges + filter button */}
      <div className="tl-edit-filters">
        <div style={{ position: "relative" }} ref={filterPopupRef}>
          <button
            onClick={() => setShowFilterPopup(!showFilterPopup)}
            className="tl-edit-filter-btn"
          >
            Filtrar
          </button>

          {showFilterPopup && (
            <div className="tl-filter-popup">
              <div className="tl-filter-popup-title">Selecionar grupos</div>
              <div className="tl-filter-popup-list">
                {availableGroups.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    className={`tl-filter-popup-item${activeGroups.includes(g) ? " tl-filter-popup-item-active" : ""}`}
                  >
                    <span className={`tl-filter-popup-check${activeGroups.includes(g) ? " tl-filter-popup-check-active" : ""}`}>
                      {activeGroups.includes(g) ? "✓" : ""}
                    </span>
                    {g}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addGroup();
                }}
                className="tl-filter-popup-add"
              >
                <input
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  placeholder="+ adicionar grupo"
                  className="tl-filter-popup-add-input"
                />
              </form>
            </div>
          )}
        </div>

        {activeGroups.length > 0 && activeGroups.map((g) => (
          <span key={g} className="tl-edit-chip tl-edit-chip-active">
            {g}
          </span>
        ))}
        {activeGroups.length === 0 && (
          <span className="tl-edit-filter-label">Todos os grupos</span>
        )}
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

// Styles kept in timeline.css (.tl-edit-* classes)

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
