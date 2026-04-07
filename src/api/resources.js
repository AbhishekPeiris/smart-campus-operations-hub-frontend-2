import API from './axios';
export const createResource = (data) => API.post('/resources', data);
export const updateResource = (id, data) => API.put(`/resources/${id}`, data);
export const updateResourceStatus = (id, status) => API.patch(`/resources/${id}/status?status=${status}`);
export const getResource = (id) => API.get(`/resources/${id}`);
export const getResourceByCode = (code) => API.get(`/resources/code/${code}`);
export const searchResources = (params = {}) => {
  const q = new URLSearchParams();
  if (params.resourceType) q.append('resourceType', params.resourceType);
  if (params.minCapacity) q.append('minCapacity', params.minCapacity);
  if (params.location) q.append('location', params.location);
  if (params.status) q.append('status', params.status);
  q.append('page', params.page || 0);
  q.append('size', params.size || 10);
  return API.get(`/resources?${q.toString()}`);
};
export const getResourceMetadata = () => API.get('/resources/metadata/options');
export const deleteResource = (id) => API.delete(`/resources/${id}`);
