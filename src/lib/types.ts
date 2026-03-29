export interface Project {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  created_at?: string;
  updated_at?: string;
}

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

export interface AllowedUser {
  id: string;
  email: string;
  role: "owner" | "viewer";
  created_at?: string;
}

export interface TimelineFilters {
  group_names?: string[];
  statuses?: ("done" | "progress" | "pending")[];
  date_from?: string;
  date_to?: string;
}

export interface Timeline {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  filters: TimelineFilters;
  is_public: boolean;
  owner_email: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
