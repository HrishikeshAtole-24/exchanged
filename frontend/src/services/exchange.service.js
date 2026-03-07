import apiClient from './apiClient';

export const exchangeService = {
  getExchanges(params = {}) {
    return apiClient.get('/exchanges', {
      params: { per_page: 100, page: 1, ...params },
    });
  },

  getExchange(id) {
    return apiClient.get(`/exchanges/${encodeURIComponent(id)}`);
  },
};
