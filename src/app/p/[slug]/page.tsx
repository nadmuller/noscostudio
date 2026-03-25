import { createAdminClient } from "@/lib/supabase/admin";
import { Timeline } from "@/components/Timeline";
import { notFound } from "next/navigation";
import type { Task, Timeline as TimelineType } from "@/lib/types";
import { applyFilters } from "@/lib/timelines";

export default async function PublicTimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Fetch the timeline — only if public
  const { data: timeline } = await supabase
    .from("timelines")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!timeline) notFound();

  const tl = timeline as TimelineType;

  // Fetch filtered tasks
  let query = supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  query = applyFilters(query, tl.filters);

  const { data: tasks } = await query;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={headerStyle}>
        <div>
          <span style={brandStyle}>Nosco Studio</span>
          <span style={sepStyle}>·</span>
          <span style={nameStyle}>{tl.name}</span>
        </div>
      </header>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Timeline tasks={(tasks as Task[]) || []} readOnly />
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: "20px 40px",
  borderBottom: "1px solid #cec9c6",
  background: "#f3f2f3",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const brandStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "#22221e",
};

const sepStyle: React.CSSProperties = {
  margin: "0 12px",
  color: "#a19891",
  fontSize: 10,
};

const nameStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 300,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#a19891",
};
