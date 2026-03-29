import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import type { Timeline, Project } from "@/lib/types";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Carregar o primeiro projeto do usuário (por enquanto só Alicerce)
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  const currentProject = (projects as Project[])?.[0] || null;

  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .eq("project_id", currentProject?.id || "")
    .order("sort_order", { ascending: true });

  return (
    <>
      <Navbar
        timelines={(timelines as Timeline[]) || []}
        userEmail={user?.email || ""}
      />
      {children}
    </>
  );
}
