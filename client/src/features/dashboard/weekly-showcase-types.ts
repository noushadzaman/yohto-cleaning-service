/**
 * Weekly table cell payload — matches DB `task_details` (see Prisma `TaskDetail`).
 * `id` is a string placeholder until loaded from the API (numeric id).
 */
export type TaskDetail = {
  id: string | number;
  /** ISO date `yyyy-mm-dd` when known (from API). */
  date: string;
  text: string;
};

/** Row model for `/weekly` — each column is a `TaskDetail`, not main-dashboard `TaskRecord`. */
export type WeeklyShowcaseRow = {
  id: string;
  title: TaskDetail;
  weekdayDate: TaskDetail;
  customer: TaskDetail;
  pointOfBusiness: TaskDetail;
  keysSandra: TaskDetail;
  alarmSandra: TaskDetail;
  instructions: TaskDetail;
  specialEquipmentDetergent: TaskDetail;
  maxTimeHoursInclusiveOfDriving: TaskDetail;
};

export type WeeklyShowcaseColumnKey = Exclude<keyof WeeklyShowcaseRow, "id">;

export type WeeklyShowcaseHeaderStyle = "default" | "keysSandra" | "alarmSandra";

export type WeeklyShowcaseColumnHeader = {
  columnKey: WeeklyShowcaseColumnKey;
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
};

export type WeeklyShowcaseColumn = {
  key: WeeklyShowcaseColumnKey;
  label: string;
  thClass: string;
  tdClass: string;
  contentAlign: "left" | "center";
  headerStyle: WeeklyShowcaseHeaderStyle;
};

const WEEKLY_TH_BASE =
  "px-4 py-3.5 text-center text-sm font-bold leading-snug bg-muted text-foreground";

const TD_BORDER = "border-border";

const TD_LAYOUT: Record<
  WeeklyShowcaseColumnKey,
  {
    thMinWidthClass: string;
    tdMinWidthClass: string;
    tdClass: string;
    contentAlign: "left" | "center";
    isFirst?: boolean;
  }
> = {
  title: {
    thMinWidthClass: "min-w-[11rem]",
    tdMinWidthClass: "min-w-[11rem]",
    tdClass: `border-b border-l border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
    isFirst: true,
  },
  weekdayDate: {
    thMinWidthClass: "min-w-[10rem]",
    tdMinWidthClass: "min-w-[10rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-muted-foreground`,
    contentAlign: "center",
  },
  customer: {
    thMinWidthClass: "min-w-[11rem]",
    tdMinWidthClass: "min-w-[11rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  pointOfBusiness: {
    thMinWidthClass: "min-w-[14rem]",
    tdMinWidthClass: "min-w-[14rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  keysSandra: {
    thMinWidthClass: "min-w-[11rem]",
    tdMinWidthClass: "min-w-[11rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  alarmSandra: {
    thMinWidthClass: "min-w-[11rem]",
    tdMinWidthClass: "min-w-[11rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  instructions: {
    thMinWidthClass: "min-w-[16rem]",
    tdMinWidthClass: "min-w-[16rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  specialEquipmentDetergent: {
    thMinWidthClass: "min-w-[14rem]",
    tdMinWidthClass: "min-w-[14rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top text-foreground`,
    contentAlign: "left",
  },
  maxTimeHoursInclusiveOfDriving: {
    thMinWidthClass: "min-w-[8rem]",
    tdMinWidthClass: "min-w-[8rem]",
    tdClass: `border-b border-r ${TD_BORDER} p-0 align-top tabular-nums text-muted-foreground`,
    contentAlign: "center",
  },
};

export const DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS: WeeklyShowcaseColumnHeader[] = [
  { columnKey: "title", label: "Title", headerStyle: "default" },
  { columnKey: "weekdayDate", label: "Weekday / date", headerStyle: "default" },
  { columnKey: "customer", label: "Customer", headerStyle: "default" },
  {
    columnKey: "pointOfBusiness",
    label: "Point of business / exact work area",
    headerStyle: "default",
  },
  { columnKey: "keysSandra", label: "Keys Sandra fills in", headerStyle: "default" },
  { columnKey: "alarmSandra", label: "Alarm Sandra fills in", headerStyle: "default" },
  { columnKey: "instructions", label: "Instructions", headerStyle: "default" },
  {
    columnKey: "specialEquipmentDetergent",
    label: "Special equipment / detergent",
    headerStyle: "default",
  },
  {
    columnKey: "maxTimeHoursInclusiveOfDriving",
    label: "Max time (h) inclusive of driving",
    headerStyle: "default",
  },
];

export const WEEKLY_SHOWCASE_HEADER_STYLE_OPTIONS: {
  value: WeeklyShowcaseHeaderStyle;
  label: string;
}[] = [
  { value: "default", label: "Default (dark gray)" },
  { value: "keysSandra", label: "Keys Sandra (amber)" },
  { value: "alarmSandra", label: "Alarm Sandra (rose)" },
];

const HEADER_STYLE_SET = new Set<string>(
  WEEKLY_SHOWCASE_HEADER_STYLE_OPTIONS.map((option) => option.value)
);

function normalizeHeaderStyle(value: string): WeeklyShowcaseHeaderStyle {
  return HEADER_STYLE_SET.has(value) ? (value as WeeklyShowcaseHeaderStyle) : "default";
}

function buildThClass(columnKey: WeeklyShowcaseColumnKey): string {
  const layout = TD_LAYOUT[columnKey];
  const borderSides = layout.isFirst
    ? `border-b border-l border-r border-t ${TD_BORDER}`
    : `border-b border-r border-t ${TD_BORDER}`;
  return `${layout.thMinWidthClass} ${borderSides} ${WEEKLY_TH_BASE}`;
}

export function buildWeeklyShowcaseColumns(
  headers: WeeklyShowcaseColumnHeader[] | null | undefined = DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
): WeeklyShowcaseColumn[] {
  const resolvedHeaders =
    headers && headers.length > 0 ? headers : DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS;
  const byKey = new Map(resolvedHeaders.map((header) => [header.columnKey, header]));

  return DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.map((defaults) => {
    const header = byKey.get(defaults.columnKey) ?? defaults;
    const layout = TD_LAYOUT[header.columnKey];
    const style = normalizeHeaderStyle(header.headerStyle);
    return {
      key: header.columnKey,
      label: header.label,
      headerStyle: style,
      thClass: buildThClass(header.columnKey),
      tdClass: `${layout.tdMinWidthClass} ${layout.tdClass}`,
      contentAlign: layout.contentAlign,
    };
  });
}

/** Default columns for static key iteration (merge, row utils). */
export const WEEKLY_SHOWCASE_COLUMNS = buildWeeklyShowcaseColumns();

/** Row returned from GET /api/task-details */
export type TaskDetailRecord = {
  id: number;
  rowKey: string;
  columnKey: WeeklyShowcaseColumnKey;
  date: string;
  text: string;
};
