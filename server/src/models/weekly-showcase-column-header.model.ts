import { randomBytes } from 'node:crypto';
import prisma from '../config/database';
import {
  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
  type WeeklyShowcaseHeaderStyle,
} from '../constants/weekly-showcase-header';
import {
  isCustomWeeklyColumnKey,
  isWeeklyTaskDetailColumnKey,
  type WeeklyTaskDetailColumnKey,
} from '../constants/weekly-task-detail';

export type WeeklyShowcaseColumnHeaderRow = {
  columnKey: string;
  label: string;
  headerStyle: string;
  isVisible: boolean;
  sortOrder: number;
};

export async function findAllWeeklyShowcaseColumnHeaders(): Promise<WeeklyShowcaseColumnHeaderRow[]> {
  return prisma.weeklyShowcaseColumnHeader.findMany({
    orderBy: [{ sortOrder: 'asc' }, { columnKey: 'asc' }],
  });
}

export async function countVisibleWeeklyShowcaseColumnHeaders(): Promise<number> {
  return prisma.weeklyShowcaseColumnHeader.count({
    where: { isVisible: true },
  });
}

export async function upsertWeeklyShowcaseColumnHeader(params: {
  columnKey: string;
  label: string;
  headerStyle: WeeklyShowcaseHeaderStyle;
  isVisible?: boolean;
  sortOrder?: number;
}): Promise<WeeklyShowcaseColumnHeaderRow> {
  const createData = {
    columnKey: params.columnKey,
    label: params.label,
    headerStyle: params.headerStyle,
    isVisible: params.isVisible ?? true,
    sortOrder: params.sortOrder ?? 0,
  };

  return prisma.weeklyShowcaseColumnHeader.upsert({
    where: { columnKey: params.columnKey },
    create: createData,
    update: {
      label: params.label,
      headerStyle: params.headerStyle,
      ...(params.isVisible !== undefined ? { isVisible: params.isVisible } : {}),
      ...(params.sortOrder !== undefined ? { sortOrder: params.sortOrder } : {}),
    },
  });
}

export async function createCustomWeeklyShowcaseColumnHeader(params: {
  label: string;
  sortOrder: number;
}): Promise<WeeklyShowcaseColumnHeaderRow> {
  const columnKey = `custom_${randomBytes(8).toString('hex')}`;

  return prisma.weeklyShowcaseColumnHeader.create({
    data: {
      columnKey,
      label: params.label,
      headerStyle: 'default',
      isVisible: true,
      sortOrder: params.sortOrder,
    },
  });
}

export async function setWeeklyShowcaseColumnVisibility(params: {
  columnKey: string;
  isVisible: boolean;
}): Promise<WeeklyShowcaseColumnHeaderRow | null> {
  try {
    return await prisma.weeklyShowcaseColumnHeader.update({
      where: { columnKey: params.columnKey },
      data: { isVisible: params.isVisible },
    });
  } catch {
    return null;
  }
}

export async function deleteWeeklyShowcaseColumnHeader(
  columnKey: string,
): Promise<boolean> {
  if (!isCustomWeeklyColumnKey(columnKey)) {
    return false;
  }

  await prisma.$transaction([
    prisma.taskDetail.deleteMany({ where: { columnKey } }),
    prisma.weeklyShowcaseColumnHeader.delete({ where: { columnKey } }),
  ]);

  return true;
}

export async function ensureDefaultWeeklyShowcaseColumnHeaders(): Promise<void> {
  for (const [index, header] of DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.entries()) {
    await prisma.weeklyShowcaseColumnHeader.upsert({
      where: { columnKey: header.columnKey },
      create: {
        columnKey: header.columnKey,
        label: header.label,
        headerStyle: header.headerStyle,
        isVisible: true,
        sortOrder: index,
      },
      update: {},
    });
  }
}

export function isBuiltInWeeklyColumnKey(
  columnKey: string,
): columnKey is WeeklyTaskDetailColumnKey {
  return isWeeklyTaskDetailColumnKey(columnKey);
}
