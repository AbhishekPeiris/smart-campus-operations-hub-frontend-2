import API from './axios';
export const addComment = (ticketId, userId, data) => API.post(`/tickets/comments?ticketId=${ticketId}&userId=${userId}`, data);
export const updateComment = (commentId, data) => API.put(`/tickets/comments/${commentId}`, data);
export const deleteComment = (commentId) => API.delete(`/tickets/comments/${commentId}`);
export const getCommentsByTicket = (ticketId) => API.get(`/tickets/comments/${ticketId}`);
