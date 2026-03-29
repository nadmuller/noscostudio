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

  // Fetch task counts per project
  const projectsWithCounts = await Promise.all(
    allProjects.map(async (p) => {
      const { count } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("project_id", p.id);
      return { ...p, task_count: count || 0 };
    })
  );

  return (
    <ProjectsHome
      projects={projectsWithCounts}
      userEmail={user?.email || ""}
    />
  );
}
