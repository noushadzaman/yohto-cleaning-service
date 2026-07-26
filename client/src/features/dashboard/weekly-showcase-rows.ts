import type { TaskDetail, WeeklyShowcaseRow } from "./weekly-showcase-types";
import { BUILT_IN_WEEKLY_COLUMN_KEYS } from "./weekly-showcase-types";

const EM = "—";

function cell(rowKey: string, column: string): TaskDetail {
  return {
    id: `${rowKey}-${column}`,
    date: "",
    text: EM,
  };
}

/** One empty row for `year` + calendar `week` (row suffix e.g. `"1"` → id `2026-w18-1`). */
export function createBlankWeeklyRow(
  year: number,
  week: number,
  rowSuffix: string,
  columnKeys: readonly string[] = BUILT_IN_WEEKLY_COLUMN_KEYS
): WeeklyShowcaseRow {
  const id = `${year}-w${week}-${rowSuffix}`;
  const row: WeeklyShowcaseRow = { id };

  for (const column of columnKeys) {
    row[column] = cell(id, column);
  }

  return row;
}
