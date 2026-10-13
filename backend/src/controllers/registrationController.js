import * as registrationService from '../services/registrationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submit = asyncHandler(async (req, res) => {
  const result = await registrationService.submit(req.body, { ip: req.ip });
  res.status(202).json(result);
});

export const getStatus = asyncHandler(async (req, res) => {
  res.json(await registrationService.getStatus(req.body));
});

export const list = asyncHandler(async (req, res) => {
  res.json(await registrationService.list(req.query.status));
});

export const approve = asyncHandler(async (req, res) => {
  await registrationService.approve(req.params.id, req.user, { ip: req.ip });
  res.status(204).end();
});

export const reject = asyncHandler(async (req, res) => {
  await registrationService.reject(req.params.id, req.user, { ip: req.ip });
  res.status(204).end();
});
