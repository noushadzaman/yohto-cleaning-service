/** Allowed `columnKey` values for `task_details` (must match client weekly columns). */
export const WEEKLY_TASK_DETAIL_COLUMN_KEYS = [
  'title',
  'weekdayDate',
  'customer',
  'pointOfBusiness',
  'keysSandra',
  'alarmSandra',
  'instructions',
  'specialEquipmentDetergent',
  'maxTimeHoursInclusiveOfDriving',
] as const;

export type WeeklyTaskDetailColumnKey = (typeof WEEKLY_TASK_DETAIL_COLUMN_KEYS)[number];

export const CUSTOM_WEEKLY_COLUMN_KEY_PREFIX = 'custom_';

export function isCustomWeeklyColumnKey(value: string): boolean {
  return /^custom_[a-z0-9]{8,32}$/i.test(value);
}

export function isWeeklyTaskDetailColumnKey(
  value: string,
): value is WeeklyTaskDetailColumnKey {
  return (WEEKLY_TASK_DETAIL_COLUMN_KEYS as readonly string[]).includes(value);
}

/** Built-in or admin-created custom weekly showcase column keys. */
export function isWeeklyColumnKey(value: string): boolean {
  return isWeeklyTaskDetailColumnKey(value) || isCustomWeeklyColumnKey(value);
}
