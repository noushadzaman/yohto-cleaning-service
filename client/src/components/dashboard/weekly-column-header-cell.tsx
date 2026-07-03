import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeeklyShowcaseColumn } from "@/features/dashboard/weekly-showcase-types";

type WeeklyColumnHeaderCellProps = {
  column: WeeklyShowcaseColumn;
  canEdit?: boolean;
  isActive?: boolean;
  onActivate?: () => void;
  onEdit?: () => void;
};

export function WeeklyColumnHeaderCell({
  column,
  canEdit = false,
  isActive = false,
  onActivate,
  onEdit,
}: WeeklyColumnHeaderCellProps) {
  return (
    <th
      className={cn(
        "relative",
        column.thClass,
        canEdit && "cursor-pointer select-none"
      )}
      onClick={canEdit ? onActivate : undefined}
    >
      <div className="flex items-center justify-center gap-1 px-1">
        <span className="leading-snug">{column.label}</span>
        {canEdit && isActive ? (
          <button
            type="button"
            className={cn(
              "rounded-md p-1 text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-indigo-500 dark:hover:text-indigo-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
            )}
            aria-label={`Edit header for ${column.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
    </th>
  );
}
