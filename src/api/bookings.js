import API from './axios';
export const createBooking = (data) => API.post('/bookings', data);
export const reviewBooking = (id, data) => API.patch(`/bookings/${id}/review`, data);
export const approveBooking = (id, data) => API.patch(`/bookings/${id}/approve`, data);
export const rejectBooking = (id, data) => API.patch(`/bookings/${id}/reject`, data);
export const cancelBooking = (id, data) => API.patch(`/bookings/${id}/cancel`, data);
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const getMyBookings = (params = {}) => {
  const q = new URLSearchParams();
  if (params.status) q.append('status', params.status);
  if (params.bookingDate) q.append('bookingDate', params.bookingDate);
  q.append('page', params.page || 0);
  q.append('size', params.size || 10);
  return API.get(`/bookings/my?${q.toString()}`);
};
export const getAllBookings = (params = {}) => {
  const q = new URLSearchParams();
  if (params.status) q.append('status', params.status);
  if (params.resourceId) q.append('resourceId', params.resourceId);
  if (params.requestedByUserId) q.append('requestedByUserId', params.requestedByUserId);
  if (params.bookingDate) q.append('bookingDate', params.bookingDate);
  q.append('page', params.page || 0);
  q.append('size', params.size || 10);
  return API.get(`/bookings?${q.toString()}`);
};
export const getBookingsByResource = (resourceId, params = {}) => {
  const q = new URLSearchParams();
  if (params.bookingDate) q.append('bookingDate', params.bookingDate);
  if (params.status) q.append('status', params.status);
  q.append('page', params.page || 0);
  q.append('size', params.size || 10);
  return API.get(`/bookings/resource/${resourceId}?${q.toString()}`);
};
export const checkConflicts = (resourceId, bookingDate, startTime, endTime) =>
  API.get(`/bookings/conflicts?resourceId=${resourceId}&bookingDate=${bookingDate}&startTime=${startTime}&endTime=${endTime}`);
