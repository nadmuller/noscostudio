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

  // Fetch filtered tasks (scoped to the timeline's project)
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("project_id", tl.project_id)
    .order("due_date", { ascending: true });

  query = applyFilters(query, tl.filters);

  const { data: tasks } = await query;

  return (
    <div style={{ minHeight: "100vh", overflowY: "auto" }}>
      <Timeline
        tasks={(tasks as Task[]) || []}
        readOnly
        timelineName={tl.name}
      />
    </div>
  );
}
