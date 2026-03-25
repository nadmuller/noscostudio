export interface Task {
  id: string;
  group_name: string;
  name: string;
  due_date: string;
  status: "done" | "progress" | "pending";
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface AllowedUser {
  id: string;
  email: string;
  role: "owner" | "viewer";
  created_at?: string;
}
