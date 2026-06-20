import api from './client';

export const createBooking = (serviceId) =>
  api.post('/bookings', { serviceId }).then((r) => r.data);

export const payForBooking = (bookingId, cardNumber) =>
  api.post(`/bookings/${bookingId}/pay`, { cardNumber }).then((r) => r.data);

export const getMyBookings = () =>
  api.get('/bookings/mine').then((r) => r.data);

export const getVendorBookings = () =>
  api.get('/bookings/vendor').then((r) => r.data);

export const completeBooking = (bookingId) =>
  api.patch(`/bookings/${bookingId}/complete`).then((r) => r.data);