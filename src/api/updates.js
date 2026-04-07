import API from './axios';
export const getTechnicianUpdates = (ticketId) => API.get(`/tickets/updates/${ticketId}`);
