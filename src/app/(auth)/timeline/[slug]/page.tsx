import { createClient } from "@/lib/supabase/server";
import { TimelineView } from "@/components/TimelineView";
import { notFound } from "next/navigation";
import type { Task, Timeline as TimelineType } from "@/lib/types";
import { applyFilters } from "@/lib/timelines";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the timeline record
  const { data: timeline } = await supabase
    .from("timelines")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!timeline) notFound();

  const tl = timeline as TimelineType;

  // Build filtered tasks query
  let query = supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  query = applyFilters(query, tl.filters);

  const { data: tasks } = await query;

  return <TimelineView timeline={tl} tasks={(tasks as Task[]) || []} />;
}
