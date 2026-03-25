import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import type { Task, Timeline } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  const { data: timelines } = await supabase
    .from("timelines")
    .select("*")
    .order("sort_order", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardClient
      tasks={(tasks as Task[]) || []}
      timelines={(timelines as Timeline[]) || []}
      userEmail={user?.email || ""}
    />
  );
}
