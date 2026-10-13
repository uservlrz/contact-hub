import * as auditService from '../services/auditService.js';
import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboard = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getOverview());
});

export const activity = asyncHandler(async (req, res) => {
  res.json(await auditService.list(req.query));
});
