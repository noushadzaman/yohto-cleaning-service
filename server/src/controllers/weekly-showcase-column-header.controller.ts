import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS,
  isWeeklyShowcaseHeaderStyle,
} from '../constants/weekly-showcase-header';
import { isWeeklyTaskDetailColumnKey } from '../constants/weekly-task-detail';
import * as headerModel from '../models/weekly-showcase-column-header.model';

function isHeadersTableMissing(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021' &&
    (error.meta as { modelName?: string } | undefined)?.modelName ===
      'WeeklyShowcaseColumnHeader'
  );
}

function serialize(row: { columnKey: string; label: string; headerStyle: string }) {
  return {
    columnKey: row.columnKey,
    label: row.label,
    headerStyle: row.headerStyle,
  };
}

function mergeWithDefaults(
  rows: { columnKey: string; label: string; headerStyle: string }[],
) {
  const byKey = new Map(rows.map((row) => [row.columnKey, row]));
  return DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.map((defaults) => {
    const saved = byKey.get(defaults.columnKey);
    return saved ? serialize(saved) : serialize(defaults);
  });
}

export async function getWeeklyShowcaseColumnHeaders(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const rows = await headerModel.findAllWeeklyShowcaseColumnHeaders();
    if (rows.length === 0) {
      res.json(DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.map(serialize));
      return;
    }
    res.json(mergeWithDefaults(rows));
  } catch (error) {
    console.error('Error fetching weekly showcase column headers:', error);
    if (isHeadersTableMissing(error)) {
      res.json(DEFAULT_WEEKLY_SHOWCASE_COLUMN_HEADERS.map(serialize));
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

type UpsertBody = {
  columnKey?: unknown;
  label?: unknown;
  headerStyle?: unknown;
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

  if (!isWeeklyTaskDetailColumnKey(columnKey)) {
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
