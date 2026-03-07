import apiClient from './apiClient';

export const marketService = {
  getMarkets(params = {}) {
    return apiClient.get('/markets', {
      params: { vs_currency: 'usd', per_page: 100, page: 1, ...params },
    });
  },

  getTrending() {
    return apiClient.get('/markets/trending');
  },

  getGlobal() {
    return apiClient.get('/markets/global');
  },

  search(q) {
    return apiClient.get('/markets/search', { params: { q } });
  },
};
