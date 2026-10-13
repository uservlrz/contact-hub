import * as contactService from '../services/contactService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await contactService.list(req.query));
});

export const getById = asyncHandler(async (req, res) => {
  res.json(await contactService.getById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await contactService.create(req.body, req.user, { ip: req.ip }));
});
