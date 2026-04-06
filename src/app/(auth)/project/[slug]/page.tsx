import { createClient } from "@/lib/supabase/server";
import { ProjectModules } from "@/components/ProjectModules";
import { notFound } from "next/navigation";
import type { Project } from "@/lib/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const proj = project as Project;

  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("project_id", proj.id);

  return (
    <ProjectModules
      projectName={proj.name}
      projectSlug={proj.slug}
      taskCount={count || 0}
    />
  );
}
