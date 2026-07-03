import { WEEKLY_TASK_DETAIL_COLUMN_KEYS } from './weekly-task-detail';

export const WEEKLY_SHOWCASE_HEADER_STYLES = [
  'default',
  'keysSandra',
  'alarmSandra',
] as const;

export type WeeklyShowcaseHeaderStyle = (typeof WEEKLY_SHOWCASE_HEADER_STYLES)[number];

export function isWeeklyShowcaseHeaderStyle(value: string): value is WeeklyShowcaseHeaderStyle {
  return (WEEKLY_SHOWCASE_HEADER_STYLES as readonly string[]).includes(value);
}

export const DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS: {
  columnKey: (typeof WEEKLY_TASK_DETAIL_COLUMN_KEYS)[number];
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
}[] = [
  { columnKey: 'title', label: 'Title', headerStyle: 'default' },
  { columnKey: 'weekdayDate', label: 'Weekday / date', headerStyle: 'default' },
  { columnKey: 'customer', label: 'Customer', headerStyle: 'default' },
  { columnKey: 'pointOfBusiness', label: 'Point of business / exact work area', headerStyle: 'default' },
  { columnKey: 'keysSandra', label: 'Keys Sandra fills in', headerStyle: 'keysSandra' },
  { columnKey: 'alarmSandra', label: 'Alarm Sandra fills in', headerStyle: 'alarmSandra' },
  { columnKey: 'instructions', label: 'Instructions', headerStyle: 'default' },
  { columnKey: 'specialEquipmentDetergent', label: 'Special equipment / detergent', headerStyle: 'default' },
  {
    columnKey: 'maxTimeHoursInclusiveOfDriving',
    label: 'Max time (h) inclusive of driving',
    headerStyle: 'default',
  },
];
