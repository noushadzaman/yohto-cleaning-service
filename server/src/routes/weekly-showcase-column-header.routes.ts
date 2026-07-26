import { Router } from 'express';
import * as headerController from '../controllers/weekly-showcase-column-header.controller';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.get(
  '/column-headers',
  authenticate,
  requireApproved,
  headerController.getWeeklyShowcaseColumnHeaders,
);

router.put(
  '/column-headers',
  authenticate,
  requireApproved,
  requireAdmin,
  headerController.upsertWeeklyShowcaseColumnHeader,
);

router.post(
  '/column-headers',
  authenticate,
  requireApproved,
  requireAdmin,
  headerController.createWeeklyShowcaseColumn,
);

router.patch(
  '/column-headers/:columnKey',
  authenticate,
  requireApproved,
  requireAdmin,
  headerController.restoreWeeklyShowcaseColumn,
);

router.delete(
  '/column-headers/:columnKey',
  authenticate,
  requireApproved,
  requireAdmin,
  headerController.removeWeeklyShowcaseColumn,
);

export default router;
