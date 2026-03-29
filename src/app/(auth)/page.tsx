import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import type { Task, Project } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Carregar o primeiro projeto do usuário
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  const currentProject = (projects as Project[])?.[0] || null;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", currentProject?.id || "")
    .order("due_date", { ascending: true });

  const allTasks = (tasks as Task[]) || [];
  const groups = [...new Set(allTasks.map((t) => t.group_name))];

  return (
    <DashboardClient
      tasks={allTasks}
      existingGroups={groups}
      userEmail={user?.email || ""}
      projectId={currentProject?.id || ""}
    />
  );
}
