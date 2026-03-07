import apiClient from './apiClient';

export const alertService = {
  getAlerts() {
    return apiClient.get('/alerts');
  },

  getTriggered() {
    return apiClient.get('/alerts/triggered');
  },

  create(coinId, targetPrice, direction) {
    return apiClient.post('/alerts', { coinId, targetPrice, direction });
  },

  remove(id) {
    return apiClient.delete(`/alerts/${id}`);
  },
};
