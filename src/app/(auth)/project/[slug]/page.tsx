import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import { notFound } from "next/navigation";
import type { Task, Project } from "@/lib/types";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Run auth + project in parallel
  const [{ data: { user } }, { data: project }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("projects").select("*").eq("slug", slug).single(),
  ]);

  if (!project) notFound();

  const proj = project as Project;

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", proj.id)
    .order("due_date", { ascending: true });

  const allTasks = (tasks as Task[]) || [];
  const groups = [...new Set(allTasks.map((t) => t.group_name))];

  return (
    <DashboardClient
      tasks={allTasks}
      existingGroups={groups}
      userEmail={user?.email || ""}
      projectId={proj.id}
      projectSlug={proj.slug}
    />
  );
}
