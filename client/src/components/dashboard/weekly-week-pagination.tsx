import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatCalendarWeekRange,
  getCurrentCalendarWeek,
  isSameCalendarWeek,
  shiftCalendarWeek,
  weeklyPagePath,
  type CalendarWeekRef,
} from "@/features/dashboard/week-utils";

type WeeklyWeekPaginationProps = {
  year: number;
  weekNumber: number;
};

export function WeeklyWeekPagination({ year, weekNumber }: WeeklyWeekPaginationProps) {
  const selected: CalendarWeekRef = { year, week: weekNumber };
  const current = getCurrentCalendarWeek();
  const isCurrentWeek = isSameCalendarWeek(selected, current);
  const prev = shiftCalendarWeek(selected, -1);
  const next = shiftCalendarWeek(selected, 1);
  const rangeLabel = formatCalendarWeekRange(selected);

  return (
    <nav
      aria-label="Week navigation"
      className="flex items-center justify-between gap-4"
    >
      <Button
        asChild
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full"
      >
        <Link href={weeklyPagePath(prev)} prefetch aria-label="Previous week">
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
      </Button>

      <div className="flex min-w-0 flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-semibold text-foreground">
          Week {weekNumber}
          <span className="font-normal text-muted-foreground"> · {year}</span>
        </p>
        {rangeLabel ? (
          <p className="text-xs text-muted-foreground">{rangeLabel}</p>
        ) : null}
        {isCurrentWeek ? (
          <span className="text-[0.65rem] font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-300">
            Current week
          </span>
        ) : (
          <Button asChild variant="outline" size="sm" className="mt-1 h-7 px-3 text-xs font-medium">
            <Link href={weeklyPagePath(current)} prefetch>
              Today
            </Link>
          </Button>
        )}
      </div>

      <Button
        asChild
        variant="outline"
        size="icon"
        className="shrink-0 rounded-full"
      >
        <Link href={weeklyPagePath(next)} prefetch aria-label="Next week">
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </Button>
    </nav>
  );
}
