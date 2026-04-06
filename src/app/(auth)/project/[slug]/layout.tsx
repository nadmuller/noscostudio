import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import type { Timeline, Project, Panel } from "@/lib/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!project) notFound();

  const proj = project as Project;

  // Fetch timelines and panels for this project
  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .eq("project_id", proj.id)
    .order("sort_order", { ascending: true });

  const { data: panels } = await supabase
    .from("panels")
    .select("*")
    .eq("project_id", proj.id)
    .order("sort_order", { ascending: true });

  return (
    <>
      <Navbar
        timelines={(timelines as Timeline[]) || []}
        panels={(panels as Panel[]) || []}
        userEmail={user?.email || ""}
        projectName={proj.name}
        projectSlug={proj.slug}
      />
      {children}
    </>
  );
}
