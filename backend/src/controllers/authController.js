import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from '../utils/refreshCookie.js';

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body, { ip: req.ip });
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user });
});

export const refresh = asyncHandler(async (req, res) => {
  try {
    const { accessToken, refreshToken, user } = await authService.refresh(
      req.cookies[REFRESH_COOKIE],
      { ip: req.ip },
    );
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user });
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  res.json(await authService.getProfile(req.user.id));
});
