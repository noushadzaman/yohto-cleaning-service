import prisma from '../config/database';
import {
  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
  type WeeklyShowcaseHeaderStyle,
} from '../constants/weekly-showcase-header';
import type { WeeklyTaskDetailColumnKey } from '../constants/weekly-task-detail';

export type WeeklyShowcaseColumnHeaderRow = {
  columnKey: string;
  label: string;
  headerStyle: string;
};

export async function findAllWeeklyShowcaseColumnHeaders(): Promise<WeeklyShowcaseColumnHeaderRow[]> {
  return prisma.weeklyShowcaseColumnHeader.findMany({
    orderBy: { columnKey: 'asc' },
  });
}

export async function upsertWeeklyShowcaseColumnHeader(params: {
  columnKey: WeeklyTaskDetailColumnKey;
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
}): Promise<WeeklyShowcaseColumnHeaderRow> {
  return prisma.weeklyShowcaseColumnHeader.upsert({
    where: { columnKey: params.columnKey },
    create: {
      columnKey: params.columnKey,
      label: params.label,
      headerStyle: params.headerStyle,
    },
    update: {
      label: params.label,
      headerStyle: params.headerStyle,
    },
  });
}

export async function ensureDefaultWeeklyShowcaseColumnHeaders(): Promise<void> {
  for (const header of DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS) {
    await prisma.weeklyShowcaseColumnHeader.upsert({
      where: { columnKey: header.columnKey },
      create: {
        columnKey: header.columnKey,
        label: header.label,
        headerStyle: header.headerStyle,
      },
      update: {},
    });
  }
}
