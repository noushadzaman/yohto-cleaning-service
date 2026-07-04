import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import type { DashboardRow, TaskRecord, User } from "@/features/dashboard/types";
import { DashboardTaskCell } from "./dashboard-task-cell";
import { taskCellKey } from "./task-utils";

type UseDashboardColumnsParams = {
  users: User[];
  taskLookup: Map<string, TaskRecord>;
  canManageTasks: boolean;
  currentUserId?: number | null;
  openTaskDialog: (
    selectedUserId: number,
    selectedUserName: string,
    row: DashboardRow
  ) => void;
  openEditTaskDialog: (
    selectedUserName: string,
    row: DashboardRow,
    record: TaskRecord
  ) => void;
};

export function useDashboardColumns({
  users,
  taskLookup,
  canManageTasks,
  currentUserId = null,
  openTaskDialog,
  openEditTaskDialog,
}: UseDashboardColumnsParams): ColumnDef<DashboardRow>[] {
  return useMemo(
    () => [
      {
        id: "dateNum",
        accessorKey: "dateNum",
        header: () => (
          <abbr title="Date" className="cursor-help no-underline">
            #
          </abbr>
        ),
        cell: ({ row }) => row.original.dateNum,
      },
      {
        id: "dayName",
        accessorKey: "dayName",
        header: () => (
          <abbr title="Day of week" className="cursor-help no-underline">
            Dy
          </abbr>
        ),
        cell: ({ row }) => row.original.dayName,
      },
      {
        id: "week",
        accessorKey: "week",
        header: () => (
          <abbr title="Calendar week" className="cursor-help no-underline">
            Wk
          </abbr>
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center text-xs font-bold text-indigo-400">
            {row.original.week}
          </span>
        ),
      },
      ...users.map((currentUser) => ({
        id: `user-${currentUser.id}`,
        header: () => {
          const isSelf = currentUserId === currentUser.id;
          return (
            <span
              className={
                isSelf
                  ? "inline-block rounded-md bg-indigo-500/15 px-2 py-0.5 font-bold text-indigo-600 ring-1 ring-indigo-500/30 dark:text-indigo-300"
                  : undefined
              }
            >
              {currentUser.name}
            </span>
          );
        },
        cell: ({ row }: { row: { original: DashboardRow } }) => {
          const existing = taskLookup.get(
            taskCellKey(currentUser.id, row.original.dateNum)
          );

          if (existing) {
            return (
              <DashboardTaskCell
                task={existing}
                userName={currentUser.name}
                row={row.original}
                canEdit={canManageTasks}
                onEdit={() =>
                  openEditTaskDialog(currentUser.name, row.original, existing)
                }
              />
            );
          }

          if (!canManageTasks) {
            return null;
          }

          return (
            <div className="relative min-h-40 h-full w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-indigo-600 dark:hover:text-indigo-300"
                  aria-label={`Add task for ${currentUser.name}`}
                  onClick={() =>
                    openTaskDialog(currentUser.id, currentUser.name, row.original)
                  }
                >
                  <CirclePlus
                    className="size-5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          );
        },
      })),
    ],
    [users, canManageTasks, currentUserId, openTaskDialog, openEditTaskDialog, taskLookup]
  );
}
