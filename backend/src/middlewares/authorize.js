import { HttpError } from '../utils/httpError.js';

/** Autorização por papel (RBAC). Deve ser usado depois de `authenticate`. */
export const authorize = (...allowedRoles) => (req, res, next) =>
  allowedRoles.includes(req.user?.role) ? next() : next(HttpError.forbidden());
