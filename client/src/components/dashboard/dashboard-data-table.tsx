"use client";

import { flexRender, type Row, type Table } from "@tanstack/react-table";
import type { DashboardUserSummaries } from "@/features/dashboard/dashboard-summary";
import type { DashboardRow, User } from "@/features/dashboard/types";
import { DashboardSummaryFooter } from "./dashboard-summary-footer";
import {
  DashboardTotHoursCell,
  TOT_HOURS_HEADER_CLASS,
  TotHoursHeaderLabel,
} from "./dashboard-tot-hours-cell";
import {
  LEAD_DATE_W,
  LEAD_DAY_W,
  LEAD_WEEK_W,
  LEADING_TOTAL_REM,
  TOT_HOURS_MIN_REM,
  TOT_HOURS_W,
  USER_MIN_REM,
} from "./dashboard-table-layout";
import { cn } from "@/lib/utils";

const TABLE_CLASS =
  "w-full border-separate border-spacing-0 table-fixed caption-bottom text-center text-sm";

const STICKY_LEADING_BG = "bg-card";
const STICKY_HEADER_BG = "bg-muted/95";

function isLeadingColumn(columnId: string): boolean {
  return columnId === "dateNum" || columnId === "dayName" || columnId === "week";
}

function leadingCellTypography(columnId: string): string {
  if (!isLeadingColumn(columnId)) return "";
  return "text-xs tabular-nums tracking-tight";
}

function leadingHeaderClass(columnId: string): string {
  if (columnId === "dateNum") {
    return `${LEAD_DATE_W} sticky left-0 z-30 border-b border-l border-r border-t border-border ${STICKY_HEADER_BG} text-center backdrop-blur`;
  }
  if (columnId === "dayName") {
    return `${LEAD_DAY_W} sticky left-8 z-30 border-b border-r border-t border-border ${STICKY_HEADER_BG} text-center backdrop-blur`;
  }
  if (columnId === "week") {
    return `${LEAD_WEEK_W} sticky left-[4.5rem] z-30 border-b border-r border-t border-border ${STICKY_HEADER_BG} text-center backdrop-blur shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.45)]`;
  }
  return "";
}

function leadingBodyClass(columnId: string): string {
  if (columnId === "dateNum") {
    return `${LEAD_DATE_W} sticky left-0 z-20 border-b border-l border-r border-border ${STICKY_LEADING_BG} text-center font-bold text-foreground`;
  }
  if (columnId === "dayName") {
    return `${LEAD_DAY_W} sticky left-8 z-20 border-b border-r border-border ${STICKY_LEADING_BG} text-center font-medium text-muted-foreground`;
  }
  if (columnId === "week") {
    return `${LEAD_WEEK_W} sticky left-[4.5rem] z-20 border-b border-r border-border ${STICKY_LEADING_BG} text-center font-medium text-muted-foreground shadow-[2px_0_6px_-2px_rgba(0,0,0,0.12)] dark:shadow-[2px_0_6px_-2px_rgba(0,0,0,0.45)]`;
  }
  return "";
}

function scrollHeaderClass(isHighlighted = false): string {
  return isHighlighted
    ? "border-b border-r border-t border-indigo-500/30 bg-indigo-500/10 text-center"
    : "border-b border-r border-t border-border text-center";
}

function scrollBodyClass(columnId: string): string {
  if (columnId.startsWith("user-")) {
    return "border-b border-r border-border text-center";
  }
  return "border-b border-border text-center";
}

type DashboardDataTableProps = {
  table: Table<DashboardRow>;
  users: User[];
  summaries: DashboardUserSummaries;
  currentUserId?: number | null;
};

export function DashboardDataTable({
  table,
  users,
  summaries,
  currentUserId = null,
}: DashboardDataTableProps) {
  const userColumns = table
    .getAllLeafColumns()
    .filter((column) => column.id.startsWith("user-"));
  const hasNoUsers = userColumns.length === 0;
  const rows = table.getRowModel().rows;
  const showTotHoursColumn = !hasNoUsers;

  const tableMinWidth = hasNoUsers
    ? `${LEADING_TOTAL_REM + USER_MIN_REM}rem`
    : `${LEADING_TOTAL_REM + userColumns.length * USER_MIN_REM + (showTotHoursColumn ? TOT_HOURS_MIN_REM : 0)}rem`;

  const headerGroup = table.getHeaderGroups()[0];
  const leadingHeaders =
    headerGroup?.headers.filter((h) => isLeadingColumn(h.column.id)) ?? [];

  const renderRow = (row: Row<DashboardRow>, rowIndex: number) => (
    <tr key={row.id}>
      {row.getVisibleCells().map((cell) => {
        const id = cell.column.id;

        if (isLeadingColumn(id)) {
          return (
            <td
              key={cell.id}
              className={cn(
                "min-h-40 whitespace-nowrap px-1 py-2 align-middle transition-colors hover:bg-accent/50",
                leadingCellTypography(id),
                leadingBodyClass(id)
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        }

        if (id.startsWith("user-")) {
          return (
            <td
              key={cell.id}
              className={cn(
                "min-h-40 whitespace-normal p-0 align-top text-sm transition-colors hover:bg-accent/50",
                scrollBodyClass(id)
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          );
        }

        return null;
      })}
      {hasNoUsers && rowIndex === 0 ? (
        <td
          rowSpan={rows.length}
          className="border-b border-r border-border bg-card px-6 align-middle text-center text-sm text-muted-foreground"
        >
          No user found
        </td>
      ) : null}
      {showTotHoursColumn ? (
        <DashboardTotHoursCell
          hours={summaries.dailyTotalHoursByDay.get(row.original.dateNum) ?? 0}
        />
      ) : null}
    </tr>
  );

  return (
    <main className="border border-border bg-card shadow-lg backdrop-blur-sm">
      <div className="dashboard-table-scroll w-full min-w-0">
        <table className={TABLE_CLASS} style={{ minWidth: tableMinWidth }}>
          <colgroup>
            <col className={LEAD_DATE_W} />
            <col className={LEAD_DAY_W} />
            <col className={LEAD_WEEK_W} />
            {userColumns.map((column) => (
              <col key={`col-${column.id}`} />
            ))}
            {hasNoUsers ? <col /> : null}
            {showTotHoursColumn ? <col className={TOT_HOURS_W} /> : null}
          </colgroup>
          <thead className="bg-muted/50">
            <tr className="hover:bg-transparent">
              {leadingHeaders.map((header) => {
                const id = header.column.id;
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "h-10 whitespace-nowrap px-1 py-2 align-middle font-semibold text-foreground",
                      leadingCellTypography(id),
                      leadingHeaderClass(id)
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
              {userColumns.map((column) => {
                const header = headerGroup?.headers.find((h) => h.column.id === column.id);
                if (!header) {
                  return null;
                }
                const userId = Number(column.id.replace(/^user-/, ""));
                const isSelf = currentUserId !== null && currentUserId === userId;
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "h-10 whitespace-nowrap px-6 py-4 align-middle text-sm font-semibold text-foreground",
                      scrollHeaderClass(isSelf)
                    )}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
              {hasNoUsers ? (
                <th
                  aria-hidden
                  className="h-10 border-b border-r border-t border-border"
                />
              ) : null}
              {showTotHoursColumn ? (
                <th className={TOT_HOURS_HEADER_CLASS}>
                  <TotHoursHeaderLabel />
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child>td]:border-b-0">
            {rows.map((row, rowIndex) => renderRow(row, rowIndex))}
          </tbody>
          {showTotHoursColumn ? (
            <DashboardSummaryFooter users={users} summaries={summaries} />
          ) : null}
        </table>
      </div>
    </main>
  );
}
