import { api } from './api.js';

export const list = () => api.get('/users');
export const create = (user) => api.post('/users', user);
export const setActive = (id, active) => api.patch(`/users/${id}/status`, { active });
