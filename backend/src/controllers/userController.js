import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await userService.list());
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await userService.create(req.body, req.user, { ip: req.ip }));
});

export const setStatus = asyncHandler(async (req, res) => {
  res.json(await userService.setActive(req.params.id, req.body.active, req.user, { ip: req.ip }));
});
