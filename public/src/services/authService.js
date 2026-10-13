import { api, refreshAccessToken } from './api.js';
import * as sessionStore from './sessionStore.js';

export async function login(email, password) {
  const session = await api.post('/auth/login', { email, password }, { auth: false });
  sessionStore.setSession(session);
}

export function restoreSession() {
  return refreshAccessToken();
}

export async function logout() {
  try {
    await api.post('/auth/logout', undefined, { auth: false });
  } finally {
    sessionStore.clear();
  }
}
