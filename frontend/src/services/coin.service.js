import apiClient from './apiClient';

export const coinService = {
  getCoin(id) {
    return apiClient.get(`/coins/${encodeURIComponent(id)}`);
  },

  getChart(id, params = {}) {
    return apiClient.get(`/coins/${encodeURIComponent(id)}/chart`, {
      params: { vs_currency: 'usd', days: 7, ...params },
    });
  },
};
