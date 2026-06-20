import api from './client';

export const getCategories = () => api.get('/categories').then((r) => r.data);

export const getServices = (params = {}) =>
  api.get('/services', { params }).then((r) => r.data);

export const getServiceById = (id) =>
  api.get(`/services/${id}`).then((r) => r.data);

export const getMyServices = () =>
  api.get('/services/mine').then((r) => r.data);

export const createService = (payload) =>
  api.post('/services', payload).then((r) => r.data);

export const updateService = (id, payload) =>
  api.put(`/services/${id}`, payload).then((r) => r.data);

export const deleteService = (id) =>
  api.delete(`/services/${id}`).then((r) => r.data);