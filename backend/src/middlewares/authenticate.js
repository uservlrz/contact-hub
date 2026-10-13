import { verifyAccessToken } from '../services/tokenService.js';
import { HttpError } from '../utils/httpError.js';

export function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(HttpError.unauthorized());

  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, role: claims.role };
    return next();
  } catch {
    return next(HttpError.unauthorized('Token inválido ou expirado'));
  }
}
