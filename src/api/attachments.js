import API from './axios';
export const uploadAttachment = (ticketId, fileName, fileType, fileUrl, userId) =>
  API.post(`/tickets/attachments?ticketId=${ticketId}&fileName=${fileName}&fileType=${fileType}&fileUrl=${fileUrl}&userId=${userId}`);
export const getAttachmentsByTicket = (ticketId) => API.get(`/tickets/attachments/${ticketId}`);
export const deleteAttachment = (attachmentId) => API.delete(`/tickets/attachments/${attachmentId}`);
