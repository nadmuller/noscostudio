"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Timeline } from "./Timeline";
import { ShareToggle } from "./ShareToggle";
import type { Task, Timeline as TimelineType } from "@/lib/types";

interface TimelineViewProps {
  timeline: TimelineType;
  tasks: Task[];
  projectSlug?: string;
}

export function TimelineView({ timeline, tasks, projectSlug }: TimelineViewProps) {
  const router = useRouter();

  const handleDeleteTimeline = async () => {
    if (!confirm(`Excluir a timeline "${timeline.name}"? Esta ação não pode ser desfeita.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("timelines").delete().eq("id", timeline.id);
    if (!error) {
      const dest = projectSlug ? `/project/${projectSlug}` : "/";
      router.push(dest);
    }
  };

  const deleteBtn = (
    <button onClick={handleDeleteTimeline} style={deleteBtnStyle} title="Excluir timeline">
      Excluir
    </button>
  );

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", overflowY: "auto" }}>
      <Timeline
        tasks={tasks}
        timelineName={timeline.name}
        projectId={timeline.project_id}
        shareToggle={<ShareToggle timeline={timeline} />}
        extraHeaderRight={deleteBtn}
      />
    </div>
  );
}

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
