import api from './client';

export const getAllUsers = () => api.get('/admin/users').then((r) => r.data);
export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data);