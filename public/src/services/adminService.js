import { api } from './api.js';

export const getDashboard = () => api.get('/admin/dashboard');
export const getActivity = ({ page, limit }) =>
  api.get(`/admin/activity?${new URLSearchParams({ page, limit })}`);
