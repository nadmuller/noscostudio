import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BudgetPage } from "@/modules/budget/components/BudgetPage";
import type { Project } from "@/lib/types";

export default async function OrcamentoPage({
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

  return <BudgetPage projectId={proj.id} />;
}
