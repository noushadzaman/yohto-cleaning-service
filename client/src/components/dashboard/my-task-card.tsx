import { MapPin } from "lucide-react";
import { RichTextContent } from "@/components/ui/rich-text-content";
import {
  extractUrlFromRichText,
  isRichTextEmpty,
  looksLikeHtml,
} from "@/lib/rich-text";
import { isCalendarToday } from "@/features/dashboard/month-utils";
import type { TaskRecord } from "@/features/dashboard/types";
import { TransportTypeDot } from "./transport-type-dot";
import { transportTypeMeta } from "./transport-constants";
import { formatShiftLabel } from "./task-utils";
import { cn } from "@/lib/utils";

type MyTaskCardProps = {
  task: TaskRecord;
  /** Shown for admins when browsing all team cards. */
  workerName?: string;
};

function formatTaskDateLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parseIsoParts(isoDate: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return null;
  }
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function MyTaskCard({ task, workerName }: MyTaskCardProps) {
  const parts = parseIsoParts(task.date);
  const isToday = parts
    ? isCalendarToday(parts.year, parts.month, parts.day)
    : false;
  const transport = transportTypeMeta(task.transportType);
  const locationHref = extractUrlFromRichText(task.location);
  const hasLocation = !isRichTextEmpty(task.location);
  const locationContent = looksLikeHtml(task.location) ? (
    <RichTextContent html={task.location} inline className="text-xs" />
  ) : (
    <span className="truncate">{locationHref ? "Location" : task.location}</span>
  );

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 text-left shadow-sm",
        isToday && "bg-muted/60 dark:bg-muted/40"
      )}
    >
      <header className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          {workerName ? (
            <p className="mb-1 text-xs font-medium text-muted-foreground">{workerName}</p>
          ) : null}
          <p className="text-sm font-semibold text-foreground">
            {formatTaskDateLabel(task.date)}
          </p>
          <p className="mt-0.5 text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-300">
            {formatShiftLabel(task.shift)}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          <TransportTypeDot transportType={task.transportType} />
          <span>{transport.label}</span>
        </span>
      </header>

      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="break-words text-base font-semibold leading-snug text-foreground">
          {task.companyName}
        </p>
        <RichTextContent
          html={task.task}
          className="break-words text-sm leading-snug text-foreground/90"
        />
        {task.carName ? (
          <p className="break-words text-sm font-medium text-muted-foreground">
            {task.carName}
          </p>
        ) : null}
      </div>

      {hasLocation ? (
        <div className="mt-3 border-t border-border pt-3">
          {locationHref ? (
            <a
              href={locationHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-1.5 text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              aria-label="Open location"
            >
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {locationContent}
            </a>
          ) : (
            <div className="flex max-w-full items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {locationContent}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
