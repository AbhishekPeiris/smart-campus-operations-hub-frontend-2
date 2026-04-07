import API from './axios';
export const createTicket = (userId, data) => API.post(`/tickets?userId=${userId}`, data);
export const updateTicket = (ticketId, data) => API.put(`/tickets/${ticketId}`, data);
export const getTicket = (ticketId) => API.get(`/tickets/${ticketId}`);
export const getAllTickets = (page = 0, size = 10) => API.get(`/tickets?page=${page}&size=${size}`);
export const assignTechnician = (ticketId, data) => API.patch(`/tickets/${ticketId}/assign`, data);
export const updateTicketStatus = (ticketId, data) => API.patch(`/tickets/${ticketId}/status`, data);
export const rejectTicket = (ticketId, data) => API.patch(`/tickets/${ticketId}/reject`, data);
export const resolveTicket = (ticketId, data) => API.patch(`/tickets/${ticketId}/resolve`, data);
