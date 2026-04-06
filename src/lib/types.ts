export interface Project {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  created_at?: string;
  updated_at?: string;
}

export type { Task } from "@/modules/tasks/types";

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

export interface PanelFilters {
  group_names?: string[];
}

export interface Panel {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  filters: PanelFilters;
  owner_email: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
