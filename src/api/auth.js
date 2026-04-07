import API from './axios';
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const googleLogin = (idToken) => API.post('/auth/google', { idToken });
export const getGoogleOAuthConfig = () => API.get('/auth/oauth/google/config');
