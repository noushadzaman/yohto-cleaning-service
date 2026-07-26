import { hasRichTextContent } from "@/lib/rich-text";
import {
  getWeeklyRowCell,
  getVisibleWeeklyColumnHeaders,
  type WeeklyShowcaseColumnHeader,
  type WeeklyShowcaseRow,
} from "./weekly-showcase-types";

/** True if any column has user text (not empty and not the placeholder em dash). */
export function weeklyRowHasAnyData(
  row: WeeklyShowcaseRow,
  columnHeaders?: WeeklyShowcaseColumnHeader[]
): boolean {
  const keys = getVisibleWeeklyColumnHeaders(columnHeaders).map((header) => header.columnKey);
  for (const key of keys) {
    if (hasRichTextContent(getWeeklyRowCell(row, key).text)) {
      return true;
    }
  }
  return false;
}

/** True if any row in the list has saved cell content. */
export function weeklyRowsHaveSavedData(
  rows: WeeklyShowcaseRow[],
  columnHeaders?: WeeklyShowcaseColumnHeader[]
): boolean {
  return rows.some((row) => weeklyRowHasAnyData(row, columnHeaders));
}

/** Largest numeric row suffix for ids like `2026-w18-3` for this year/week; 0 if none match. */
export function maxRowSuffixForWeek(
  rows: WeeklyShowcaseRow[],
  year: number,
  week: number
): number {
  const re = new RegExp(`^${year}-w${week}-(\\d+)$`);
  let max = 0;
  for (const r of rows) {
    const m = re.exec(r.id);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max;
}
