import type { TimelineFilters } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyFilters<T extends { in: any; gte: any; lte: any }>(
  query: T,
  filters: TimelineFilters
): T {
  let q = query;

  if (filters.group_names && filters.group_names.length > 0) {
    q = q.in("group_name", filters.group_names);
  }
  if (filters.statuses && filters.statuses.length > 0) {
    q = q.in("status", filters.statuses);
  }
  if (filters.date_from) {
    q = q.gte("due_date", filters.date_from);
  }
  if (filters.date_to) {
    q = q.lte("due_date", filters.date_to);
  }

  return q;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPublicUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/p/${slug}`;
  }
  return `/p/${slug}`;
}
