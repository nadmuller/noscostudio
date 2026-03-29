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

  // Fetch the timeline record
  const { data: timeline } = await supabase
    .from("timelines")
    .select("*")
    .eq("slug", tslug)
    .single();

  if (!timeline) notFound();

  const tl = timeline as TimelineType;

  // Build filtered tasks query (scoped to the timeline's project)
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("project_id", tl.project_id)
    .order("due_date", { ascending: true });

  query = applyFilters(query, tl.filters);

  const { data: tasks } = await query;

  return <TimelineView timeline={tl} tasks={(tasks as Task[]) || []} projectSlug={slug} />;
}
