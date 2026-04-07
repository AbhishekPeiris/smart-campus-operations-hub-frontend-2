import API from './axios';
export const getUserProfile = (id) => API.get(`/users/${id}`);
export const getAllUsers = (page = 0, size = 10) => API.get(`/users?page=${page}&size=${size}`);
export const getUsersByRole = (role) => API.get(`/users/role/${role}`);
export const updateUserStatus = (id, enabled) => API.patch(`/users/${id}/status?enabled=${enabled}`);
export const updateUserRole = (id, role) => API.patch(`/users/${id}/role`, { role });
export const getAvailableRoles = () => API.get('/users/roles');
