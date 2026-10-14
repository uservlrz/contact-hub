import * as sessionStore from './sessionStore.js';

const BASE_URL = '/api';

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let refreshInFlight = null;

/** Renova o access token (single-flight: chamadas simultâneas compartilham o request). */
export function refreshAccessToken() {
  refreshInFlight ??= fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'same-origin',
  })
    .then(async (response) => {
      if (!response.ok) {
        sessionStore.clear();
        return false;
      }
      sessionStore.setSession(await response.json());
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function request(path, { method = 'GET', body, auth = true, canRetry = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = sessionStore.getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor');
  }

  if (response.status === 401 && auth && canRetry && (await refreshAccessToken())) {
    return request(path, { method, body, auth, canRetry: false });
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? 'Erro inesperado', payload?.details);
  }
  return payload;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
};
