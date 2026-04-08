import API from './axios';
export const createResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const updateResourceStatus = (id, status) => API.patch(`/resources/${id}/status?status=${status}`);
export const getResource = (id) => API.get(`/resources/${id}`);
export const getResourceByCode = (code) => API.get(`/resources/code/${code}`);
export const searchResources = (params = {}) => {
  const q = new URLSearchParams();
  // Only append parameters that have truthy values
  if (params.resourceType) q.append('resourceType', params.resourceType);
  if (params.minCapacity) q.append('minCapacity', params.minCapacity);
  if (params.location) q.append('location', params.location);
  if (params.status) q.append('status', params.status);
  q.append('page', params.page !== undefined ? params.page : 0);
  q.append('size', params.size !== undefined ? params.size : 10);
  const queryString = q.toString();
  return API.get(`/resources${queryString ? '?' + queryString : ''}`);
};
export const getResourceMetadata = () => API.get('/resources/metadata/options');
export const deleteResource = (id) => API.delete(`/resources/${id}`);
