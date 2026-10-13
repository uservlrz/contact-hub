import { env } from '../config/env.js';

export const REFRESH_COOKIE = 'refresh_token';

const baseOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict',
  path: '/api/auth',
});

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions(),
    maxAge: env.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, baseOptions());
}
