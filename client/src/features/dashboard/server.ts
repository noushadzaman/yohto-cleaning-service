import "server-only";

import { serverApiUrl } from "@/env";
import { getServerAuthHeaders } from "@/lib/auth/server";
import type { TaskDetailRecord, WeeklyShowcaseColumnHeader } from "@/features/dashboard/weekly-showcase-types";
import { DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS } from "@/features/dashboard/weekly-showcase-types";
import type { TaskRecord, TeamMember } from "./types";

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users"), {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}

export async function fetchApprovedTeamMembers(): Promise<TeamMember[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/users?approved=true"), {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TeamMember[];
  } catch {
    return [];
  }
}

export async function fetchTasksForMonth(year: number, month: number): Promise<TaskRecord[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/tasks?year=${year}&month=${month}`),
      { headers: authHeaders, cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TaskRecord[];
  } catch {
    return [];
  }
}

/** Fetch task_details for a single calendar week only. */
export async function fetchTaskDetailsForWeek(
  year: number,
  week: number
): Promise<TaskDetailRecord[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(
      serverApiUrl(`/api/task-details?year=${year}&week=${week}`),
      { headers: authHeaders, cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as TaskDetailRecord[];
  } catch {
    return [];
  }
}

export async function fetchWeeklyShowcaseColumnHeaders(): Promise<WeeklyShowcaseColumnHeader[]> {
  try {
    const authHeaders = await getServerAuthHeaders();
    const response = await fetch(serverApiUrl("/api/weekly-showcase/column-headers"), {
      headers: authHeaders,
      cache: "no-store",
    });

    if (!response.ok) {
      return DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS;
    }

    return (await response.json()) as WeeklyShowcaseColumnHeader[];
  } catch {
    return DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS;
  }
}
