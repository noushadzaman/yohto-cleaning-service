import { formatSummaryHours } from "@/features/dashboard/dashboard-summary";
import { cn } from "@/lib/utils";
import {
  TOT_COLUMN_BODY_CLASS,
  TOT_COLUMN_FOOTER_CLASS,
  TOT_COLUMN_HEADER_CLASS,
} from "./dashboard-summary-theme";

type DashboardTotHoursCellProps = {
  hours: number;
  variant?: "body" | "footer";
  className?: string;
};

export function DashboardTotHoursCell({
  hours,
  variant = "body",
  className,
}: DashboardTotHoursCellProps) {
  const isFooter = variant === "footer";

  return (
    <td
      className={cn(
        "border-b border-border",
        isFooter ? TOT_COLUMN_FOOTER_CLASS : cn(TOT_COLUMN_BODY_CLASS, "align-middle"),
        !isFooter && "border-r border-border",
        className
      )}
    >
      {formatSummaryHours(hours)}
    </td>
  );
}

export const TOT_HOURS_HEADER_CLASS = cn(
  TOT_COLUMN_HEADER_CLASS,
  "border-r border-border"
);

export function TotHoursHeaderLabel() {
  return (
    <span className="mx-auto block max-w-full leading-tight">
      Tot.
      <br />
      hours
    </span>
  );
}
