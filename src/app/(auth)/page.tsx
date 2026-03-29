import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";
import type { Task } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allTasks = (tasks as Task[]) || [];
  const groups = [...new Set(allTasks.map((t) => t.group_name))];

  return (
    <DashboardClient
      tasks={allTasks}
      existingGroups={groups}
      userEmail={user?.email || ""}
    />
  );
}
