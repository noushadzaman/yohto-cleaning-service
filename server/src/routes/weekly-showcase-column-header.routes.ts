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

export default router;
