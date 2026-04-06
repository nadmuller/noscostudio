import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { notFound } from "next/navigation";
import type { Timeline, Project } from "@/lib/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Run auth + project fetch in parallel
  const [{ data: { user } }, { data: project }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("projects").select("*").eq("slug", slug).single(),
  ]);

  if (!project) notFound();

  const proj = project as Project;

  // Fetch timelines
  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .eq("project_id", proj.id)
    .order("sort_order", { ascending: true });

  return (
    <>
      <Navbar
        timelines={(timelines as Timeline[]) || []}
        userEmail={user?.email || ""}
        projectName={proj.name}
        projectSlug={proj.slug}
      />
      {children}
    </>
  );
}
