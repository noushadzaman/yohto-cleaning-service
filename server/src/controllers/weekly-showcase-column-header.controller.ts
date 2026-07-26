import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
  isWeeklyShowcaseHeaderStyle,
} from '../constants/weekly-showcase-header';
import {
  isCustomWeeklyColumnKey,
  isWeeklyColumnKey,
  isWeeklyTaskDetailColumnKey,
} from '../constants/weekly-task-detail';
import * as headerModel from '../models/weekly-showcase-column-header.model';

function isHeadersTableMissing(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021' &&
    (error.meta as { modelName?: string } | undefined)?.modelName ===
      'WeeklyShowcaseColumnHeader'
  );
}

type HeaderRow = {
  columnKey: string;
  label: string;
  headerStyle: string;
  isVisible?: boolean;
  sortOrder?: number;
};

function serialize(row: HeaderRow) {
  return {
    columnKey: row.columnKey,
    label: row.label,
    headerStyle: row.headerStyle,
    isVisible: row.isVisible ?? true,
    sortOrder: row.sortOrder ?? 0,
  };
}

function defaultHeadersWithLayout() {
  return DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.map((defaults, index) =>
    serialize({
      ...defaults,
      isVisible: true,
      sortOrder: index,
    }),
  );
}

function mergeWithDefaults(rows: HeaderRow[]) {
  const byKey = new Map(rows.map((row) => [row.columnKey, row]));
  const merged: ReturnType<typeof serialize>[] = [];

  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.forEach((defaults, index) => {
    const saved = byKey.get(defaults.columnKey);
    merged.push(
      serialize(
        saved ?? {
          ...defaults,
          isVisible: true,
          sortOrder: index,
        },
      ),
    );
  });

  for (const row of rows) {
    if (isCustomWeeklyColumnKey(row.columnKey)) {
      merged.push(serialize(row));
    }
  }

  return merged.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.columnKey.localeCompare(b.columnKey),
  );
}

export async function getWeeklyShowcaseColumnHeaders(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = await headerModel.findAllWeeklyShowcaseColumnHeaders();
    if (rows.length === 0) {
      res.json(defaultHeadersWithLayout());
      return;
    }
    res.json(mergeWithDefaults(rows));
  } catch (error) {
    console.error('Error fetching weekly showcase column headers:', error);
    if (isHeadersTableMissing(error)) {
      res.json(defaultHeadersWithLayout());
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

type UpsertBody = {
  columnKey?: unknown;
  label?: unknown;
  headerStyle?: unknown;
  isVisible?: unknown;
  sortOrder?: unknown;
};

export async function upsertWeeklyShowcaseColumnHeader(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body as UpsertBody;
  const columnKey = typeof body.columnKey === 'string' ? body.columnKey.trim() : '';
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const headerStyle =
    typeof body.headerStyle === 'string' ? body.headerStyle.trim() : '';
  const isVisible =
    typeof body.isVisible === 'boolean' ? body.isVisible : undefined;
  const sortOrder =
    typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder)
      ? body.sortOrder
      : undefined;

  if (!isWeeklyColumnKey(columnKey)) {
    res.status(400).json({ error: 'Invalid columnKey' });
    return;
  }
  if (!label) {
    res.status(400).json({ error: 'label is required' });
    return;
  }
  if (!isWeeklyShowcaseHeaderStyle(headerStyle)) {
    res.status(400).json({ error: 'Invalid headerStyle' });
    return;
  }

  try {
    const saved = await headerModel.upsertWeeklyShowcaseColumnHeader({
      columnKey,
      label,
      headerStyle,
      isVisible,
      sortOrder,
    });
    res.json(serialize(saved));
  } catch (error) {
    console.error('Error upserting weekly showcase column header:', error);
    if (isHeadersTableMissing(error)) {
      res.status(503).json({
        error:
          'Database table weekly_showcase_column_headers is missing. From the server folder run: npx prisma migrate deploy',
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

type CreateBody = {
  label?: unknown;
};

export async function createWeeklyShowcaseColumn(
  req: Request,
  res: Response,
): Promise<void> {
  const body = req.body as CreateBody;
  const label = typeof body.label === 'string' ? body.label.trim() : '';

  if (!label) {
    res.status(400).json({ error: 'label is required' });
    return;
  }

  try {
    const rows = await headerModel.findAllWeeklyShowcaseColumnHeaders();
    const merged = mergeWithDefaults(rows);
    const maxSortOrder = merged.reduce((max, row) => Math.max(max, row.sortOrder), -1);

    const saved = await headerModel.createCustomWeeklyShowcaseColumnHeader({
      label,
      sortOrder: maxSortOrder + 1,
    });

    res.status(201).json(serialize(saved));
  } catch (error) {
    console.error('Error creating weekly showcase column:', error);
    if (isHeadersTableMissing(error)) {
      res.status(503).json({
        error:
          'Database table weekly_showcase_column_headers is missing. From the server folder run: npx prisma migrate deploy',
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function removeWeeklyShowcaseColumn(
  req: Request,
  res: Response,
): Promise<void> {
  const columnKey =
    typeof req.params.columnKey === 'string' ? req.params.columnKey.trim() : '';

  if (!isWeeklyColumnKey(columnKey)) {
    res.status(400).json({ error: 'Invalid columnKey' });
    return;
  }

  try {
    const rows = await headerModel.findAllWeeklyShowcaseColumnHeaders();
    const merged = mergeWithDefaults(rows);
    const target = merged.find((row) => row.columnKey === columnKey);

    if (!target) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }

    const visibleCount = merged.filter((row) => row.isVisible).length;
    if (target.isVisible && visibleCount <= 1) {
      res.status(400).json({ error: 'At least one column must remain visible.' });
      return;
    }

    if (isCustomWeeklyColumnKey(columnKey)) {
      const deleted = await headerModel.deleteWeeklyShowcaseColumnHeader(columnKey);
      if (!deleted) {
        res.status(400).json({ error: 'Only custom columns can be deleted.' });
        return;
      }
      res.status(204).send();
      return;
    }

    if (!isWeeklyTaskDetailColumnKey(columnKey)) {
      res.status(400).json({ error: 'Invalid columnKey' });
      return;
    }

    const saved = await headerModel.upsertWeeklyShowcaseColumnHeader({
      columnKey,
      label: target.label,
      headerStyle: target.headerStyle as 'default' | 'keysSandra' | 'alarmSandra',
      isVisible: false,
      sortOrder: target.sortOrder,
    });

    res.json(serialize(saved));
  } catch (error) {
    console.error('Error removing weekly showcase column:', error);
    if (isHeadersTableMissing(error)) {
      res.status(503).json({
        error:
          'Database table weekly_showcase_column_headers is missing. From the server folder run: npx prisma migrate deploy',
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

type RestoreBody = {
  isVisible?: unknown;
};

export async function restoreWeeklyShowcaseColumn(
  req: Request,
  res: Response,
): Promise<void> {
  const columnKey =
    typeof req.params.columnKey === 'string' ? req.params.columnKey.trim() : '';
  const body = req.body as RestoreBody;
  const isVisible = body.isVisible !== false;

  if (!isWeeklyColumnKey(columnKey)) {
    res.status(400).json({ error: 'Invalid columnKey' });
    return;
  }

  try {
    const rows = await headerModel.findAllWeeklyShowcaseColumnHeaders();
    const merged = mergeWithDefaults(rows);
    const target = merged.find((row) => row.columnKey === columnKey);

    if (!target) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }

    const saved = await headerModel.upsertWeeklyShowcaseColumnHeader({
      columnKey,
      label: target.label,
      headerStyle: target.headerStyle as 'default' | 'keysSandra' | 'alarmSandra',
      isVisible,
      sortOrder: target.sortOrder,
    });

    res.json(serialize(saved));
  } catch (error) {
    console.error('Error restoring weekly showcase column:', error);
    if (isHeadersTableMissing(error)) {
      res.status(503).json({
        error:
          'Database table weekly_showcase_column_headers is missing. From the server folder run: npx prisma migrate deploy',
      });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
