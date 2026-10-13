import { api } from './api.js';

export function list({ page, limit, search }) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  return api.get(`/contacts?${params}`);
}

export const get = (id) => api.get(`/contacts/${id}`);
export const create = (contact) => api.post('/contacts', contact);
