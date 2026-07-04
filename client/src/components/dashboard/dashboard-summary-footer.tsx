import {
  formatSummaryHours,
  type DashboardUserSummaries,
} from "@/features/dashboard/dashboard-summary";
import type { User } from "@/features/dashboard/types";
import { DashboardTotHoursCell } from "./dashboard-tot-hours-cell";
import { LEADING_COLUMN_COUNT, LEADING_TOTAL_REM } from "./dashboard-table-layout";
import {
  SUMMARY_FOOTER_LABEL_CLASS,
  SUMMARY_FOOTER_ROW_CLASS,
  SUMMARY_FOOTER_ROW_FIRST_CLASS,
  SUMMARY_FOOTER_VALUE_CLASS,
} from "./dashboard-summary-theme";
import { cn } from "@/lib/utils";

type DashboardSummaryFooterProps = {
  users: User[];
  summaries: DashboardUserSummaries;
};

type SummaryFooterRowProps = {
  label: string;
  users: User[];
  valuesByUserId: Map<number, number>;
  totalHours: number;
  isFirst?: boolean;
};

function SummaryFooterRow({
  label,
  users,
  valuesByUserId,
  totalHours,
  isFirst,
}: SummaryFooterRowProps) {
  return (
    <tr
      className={cn(
        SUMMARY_FOOTER_ROW_CLASS,
        isFirst && SUMMARY_FOOTER_ROW_FIRST_CLASS,
        "[&>td]:border-b [&>td]:border-border"
      )}
    >
      <td
        colSpan={LEADING_COLUMN_COUNT}
        className={cn(SUMMARY_FOOTER_LABEL_CLASS, "sticky left-0 z-20")}
        style={{
          width: `${LEADING_TOTAL_REM}rem`,
          minWidth: `${LEADING_TOTAL_REM}rem`,
          maxWidth: `${LEADING_TOTAL_REM}rem`,
        }}
      >
        {label}
      </td>
      {users.map((user) => (
        <td key={user.id} className={SUMMARY_FOOTER_VALUE_CLASS}>
          {formatSummaryHours(valuesByUserId.get(user.id) ?? 0)}
        </td>
      ))}
      <DashboardTotHoursCell hours={totalHours} variant="footer" />
    </tr>
  );
}

export function DashboardSummaryFooter({ users, summaries }: DashboardSummaryFooterProps) {
  if (users.length === 0) {
    return null;
  }

  return (
    <tfoot>
      <SummaryFooterRow
        label="SUM h/month"
        users={users}
        valuesByUserId={summaries.monthlySumByUserId}
        totalHours={summaries.grandMonthlyTotalHours}
        isFirst
      />
      <SummaryFooterRow
        label="AVERAGE h/week"
        users={users}
        valuesByUserId={summaries.weeklyAverageByUserId}
        totalHours={summaries.grandWeeklyAverageTotalHours}
      />
    </tfoot>
  );
}
