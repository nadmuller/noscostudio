import { createClient } from "@/lib/supabase/server";
import { ProjectNavbar } from "@/components/ProjectNavbar";
import { notFound } from "next/navigation";
import type { Project } from "@/lib/types";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: { user } }, { data: project }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("projects").select("*").eq("slug", slug).single(),
  ]);

  if (!project) notFound();

  const proj = project as Project;

  return (
    <>
      <ProjectNavbar
        userEmail={user?.email || ""}
        projectName={proj.name}
        projectSlug={proj.slug}
      />
      {children}
    </>
  );
}
