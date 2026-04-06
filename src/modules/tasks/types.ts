export interface Task {
  id: string;
  project_id: string;
  group_name: string;
  name: string;
  due_date: string;
  return_date?: string | null;
  status: "done" | "progress" | "pending";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
