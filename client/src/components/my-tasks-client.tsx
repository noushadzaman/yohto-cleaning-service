"use client";

import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MonthlyMonthPagination } from "@/components/dashboard/monthly-month-pagination";
import { MyTaskCard } from "@/components/dashboard/my-task-card";
import { useDashboardShell } from "@/components/dashboard/use-dashboard-shell";
import type { TaskRecord, TeamMember, User } from "@/features/dashboard/types";

export type MyTasksClientProps = {
  year: number;
  monthNumber: number;
  monthLabel: string;
  initialTeamMembers: TeamMember[];
  users: User[];
  initialTasks: TaskRecord[];
};

type UserTaskGroup = {
  userId: number;
  userName: string;
  tasks: TaskRecord[];
};

function sortTasksByDateAndShift(tasks: TaskRecord[]): TaskRecord[] {
  return [...tasks].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) {
      return byDate;
    }
    return a.shift.localeCompare(b.shift);
  });
}

function buildUserNameMap(users: User[], teamMembers: TeamMember[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const member of teamMembers) {
    map.set(member.id, member.name);
  }
  for (const user of users) {
    map.set(user.id, user.name);
  }
  return map;
}

export default function MyTasksClient({
  year,
  monthNumber,
  monthLabel,
  initialTeamMembers,
  users,
  initialTasks,
}: MyTasksClientProps) {
  const {
    user,
    loading,
    manageableMembers,
    pendingApprovalIds,
    pendingDeleteIds,
    toggleApproval,
    removeUser,
    handleLogout,
  } = useDashboardShell(initialTeamMembers, users);

  const isAdmin = Boolean(user?.isAdmin);
  const nameById = useMemo(
    () => buildUserNameMap(users, initialTeamMembers),
    [users, initialTeamMembers]
  );

  const visibleTasks = useMemo(() => {
    if (!user) {
      return [];
    }
    if (isAdmin) {
      return sortTasksByDateAndShift(initialTasks);
    }
    return sortTasksByDateAndShift(
      initialTasks.filter((task) => task.userId === user.id)
    );
  }, [initialTasks, user, isAdmin]);

  const adminGroups = useMemo((): UserTaskGroup[] => {
    if (!isAdmin) {
      return [];
    }

    const tasksByUser = new Map<number, TaskRecord[]>();
    for (const task of visibleTasks) {
      const list = tasksByUser.get(task.userId) ?? [];
      list.push(task);
      tasksByUser.set(task.userId, list);
    }

    const groups: UserTaskGroup[] = [];

    for (const teamUser of users) {
      const tasks = tasksByUser.get(teamUser.id);
      if (!tasks || tasks.length === 0) {
        continue;
      }
      groups.push({
        userId: teamUser.id,
        userName: teamUser.name,
        tasks,
      });
      tasksByUser.delete(teamUser.id);
    }

    for (const [userId, tasks] of tasksByUser) {
      groups.push({
        userId,
        userName: nameById.get(userId) ?? `User #${userId}`,
        tasks,
      });
    }

    return groups;
  }, [isAdmin, visibleTasks, users, nameById]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }

  const title = isAdmin ? "Staffs" : "My work";
  const subtitle = isAdmin
    ? `All team assignments for ${monthLabel}`
    : `Your assignments for ${monthLabel}`;
  const emptyMessage = isAdmin
    ? "No team tasks for this month."
    : "No tasks assigned to you this month.";

  return (
    <DashboardShell
      user={user}
      manageableMembers={manageableMembers}
      pendingApprovalIds={pendingApprovalIds}
      pendingDeleteIds={pendingDeleteIds}
      onToggleApproval={toggleApproval}
      onDeleteUser={removeUser}
      onLogout={handleLogout}
      title={title}
      subtitle={subtitle}
      logoSrc="/pink_logo_rgb.webp"
      logoAlt="Extra team"
    >
      <MonthlyMonthPagination
        year={year}
        monthNumber={monthNumber}
        basePath="/my-tasks"
      />

      {visibleTasks.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : isAdmin ? (
        <div className="space-y-8">
          {adminGroups.map((group) => (
            <section key={group.userId} className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-foreground">
                {group.userName}
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {group.tasks.length}{" "}
                  {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.tasks.map((task) => (
                  <MyTaskCard
                    key={task.id}
                    task={task}
                    workerName={group.userName}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task) => (
            <MyTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
