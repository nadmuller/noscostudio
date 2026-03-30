import { createClient } from "@/lib/supabase/server";
import { ProjectsHome } from "@/components/ProjectsHome";
import type { Project } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });

  const allProjects = (projects as Project[]) || [];

  // Fetch task counts in a single query
  const { data: counts } = await supabase
    .from("tasks")
    .select("project_id")
    .in("project_id", allProjects.map((p) => p.id));

  const countMap: Record<string, number> = {};
  (counts || []).forEach((row: { project_id: string }) => {
    countMap[row.project_id] = (countMap[row.project_id] || 0) + 1;
  });

  const projectsWithCounts = allProjects.map((p) => ({
    ...p,
    task_count: countMap[p.id] || 0,
  }));

  return (
    <ProjectsHome
      projects={projectsWithCounts}
      userEmail={user?.email || ""}
    />
  );
}
