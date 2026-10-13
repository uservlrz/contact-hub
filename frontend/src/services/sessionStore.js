/**
 * Sessão em memória. O access token nunca vai para localStorage/sessionStorage:
 * fica fora do alcance de scripts injetados persistentes. A sessão é restaurada
 * no reload via refresh token (cookie httpOnly).
 */
let state = { accessToken: null, user: null };
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener(state));

export const getAccessToken = () => state.accessToken;
export const getUser = () => state.user;

export function setSession({ accessToken, user }) {
  state = { accessToken, user };
  notify();
}

export function clear() {
  const hadSession = Boolean(state.user);
  state = { accessToken: null, user: null };
  if (hadSession) notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
