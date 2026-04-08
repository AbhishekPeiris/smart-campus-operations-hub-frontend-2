import API from './axios';
export const getMyNotifications = (params = {}) => {
  const q = new URLSearchParams();
  q.append('page', params.page !== undefined ? params.page : 0);
  q.append('size', params.size !== undefined ? params.size : 20);
  if (params.unreadOnly !== undefined) q.append('unreadOnly', String(Boolean(params.unreadOnly)));
  const queryString = q.toString();
  return API.get(`/notifications${queryString ? '?' + queryString : ''}`);
};
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => API.patch('/notifications/read-all');
export const getNotification = (id) => API.get(`/notifications/${id}`);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
