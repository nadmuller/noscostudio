import { createClient } from "@/lib/supabase/server";
import { Timeline } from "@/components/Timeline";
import type { Task } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });

  return <Timeline tasks={(tasks as Task[]) || []} />;
}
