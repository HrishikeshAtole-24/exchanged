import apiClient from './apiClient';

export const authService = {
  register(email, password) {
    return apiClient.post('/auth/register', { email, password });
  },

  login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  getMe() {
    return apiClient.get('/auth/me');
  },
};
