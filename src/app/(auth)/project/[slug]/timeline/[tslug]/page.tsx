import { createClient } from "@/lib/supabase/server";
import { TimelineView } from "@/components/TimelineView";
import { notFound } from "next/navigation";
import type { Task, Timeline as TimelineType } from "@/lib/types";
import { applyFilters } from "@/lib/timelines";

export default async function ProjectTimelinePage({
  params,
}: {
  params: Promise<{ slug: string; tslug: string }>;
}) {
  const { slug, tslug } = await params;
  const supabase = await createClient();

  // Fetch timeline record
  const { data: timeline } = await supabase
    .from("timelines")
    .select("*")
    .eq("slug", tslug)
    .single();

  if (!timeline) notFound();

  const tl = timeline as TimelineType;

  // Run both queries in parallel
  const filteredQuery = applyFilters(
    supabase
      .from("tasks")
      .select("*")
      .eq("project_id", tl.project_id)
      .order("due_date", { ascending: true }),
    tl.filters
  );

  const allGroupsQuery = supabase
    .from("tasks")
    .select("group_name")
    .eq("project_id", tl.project_id);

  const [{ data: tasks }, { data: allProjectTasks }] = await Promise.all([
    filteredQuery,
    allGroupsQuery,
  ]);

  const allGroups = [
    ...new Set((allProjectTasks || []).map((t: { group_name: string }) => t.group_name)),
  ].sort();

  return (
    <TimelineView
      timeline={tl}
      tasks={(tasks as Task[]) || []}
      projectSlug={slug}
      allGroups={allGroups}
    />
  );
}
