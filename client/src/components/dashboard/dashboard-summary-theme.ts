/**
 * Summary footer + TOT column — theme-aware palette aligned with the main grid.
 */

export const SUMMARY_FOOTER_ROW_CLASS = "bg-muted text-foreground hover:bg-muted";

/** Separates data rows from summary block */
export const SUMMARY_FOOTER_ROW_FIRST_CLASS = "border-t border-border";

export const SUMMARY_FOOTER_LABEL_CLASS =
  "border-r border-border bg-muted px-2.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

export const SUMMARY_FOOTER_VALUE_CLASS =
  "border-r border-border bg-muted px-2 py-2.5 text-center text-sm font-medium tabular-nums text-foreground";

/** Daily totals — subtle column band */
export const TOT_COLUMN_BODY_CLASS =
  "border-l border-border bg-muted/40 px-2 py-2.5 text-center text-sm font-medium tabular-nums text-foreground";

/** Grand totals — matches footer row, slightly stronger type */
export const TOT_COLUMN_FOOTER_CLASS =
  "border-l border-border bg-muted px-2 py-2.5 text-center text-sm font-semibold tabular-nums text-foreground";

export const TOT_COLUMN_HEADER_CLASS =
  "h-10 border-t border-b border-l border-border bg-muted/80 align-middle text-[10px] font-medium uppercase tracking-wider text-muted-foreground";
