import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PanelClient } from "@/components/PanelClient";
import type { Task, Project, Panel } from "@/lib/types";

export default async function PanelPage({
  params,
}: {
  params: Promise<{ slug: string; pslug: string }>;
}) {
  const { slug, pslug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();
  const proj = project as Project;

  const { data: panel } = await supabase
    .from("panels")
    .select("*")
    .eq("project_id", proj.id)
    .eq("slug", pslug)
    .single();

  if (!panel) notFound();
  const pnl = panel as Panel;

  // Fetch tasks, applying panel group filters
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("project_id", proj.id)
    .order("due_date", { ascending: true });

  if (pnl.filters.group_names && pnl.filters.group_names.length > 0) {
    query = query.in("group_name", pnl.filters.group_names);
  }

  const { data: tasks } = await query;
  const allTasks = (tasks as Task[]) || [];
  const groups = [...new Set(allTasks.map((t) => t.group_name))];

  // Fetch ALL groups from project (for the filter editor)
  const { data: allProjectTasks } = await supabase
    .from("tasks")
    .select("group_name")
    .eq("project_id", proj.id);
  const allGroups = [
    ...new Set((allProjectTasks || []).map((t: { group_name: string }) => t.group_name)),
  ];

  return (
    <PanelClient
      tasks={allTasks}
      existingGroups={groups}
      allGroups={allGroups}
      userEmail={user?.email || ""}
      projectId={proj.id}
      projectSlug={proj.slug}
      panel={pnl}
    />
  );
}
