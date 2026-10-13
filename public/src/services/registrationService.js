import { api } from './api.js';

const STORAGE_KEY = 'contact-hub:pending-registration';

export const submit = (values) =>
  api.post(
    '/registrations',
    { name: values.name, email: values.email, password: values.password },
    { auth: false },
  );

export const list = (status) =>
  api.get(`/registrations${status ? `?status=${encodeURIComponent(status)}` : ''}`);

export const approve = (id) => api.post(`/registrations/${id}/approve`);
export const reject = (id) => api.post(`/registrations/${id}/reject`);

/** Guarda só o par id/token de status (não contém senha) para sobreviver a um reload. */
export const rememberPending = ({ id, statusToken }) =>
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ requestId: id, statusToken }));

export function recallPending() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export const forgetPending = () => sessionStorage.removeItem(STORAGE_KEY);
