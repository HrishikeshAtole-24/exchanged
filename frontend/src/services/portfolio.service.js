import apiClient from './apiClient';

export const portfolioService = {
  getPortfolio() {
    return apiClient.get('/portfolio');
  },

  addCoin(coinId, amount, buyPrice) {
    return apiClient.post('/portfolio', { coinId, amount, buyPrice });
  },

  updateEntry(id, amount, buyPrice) {
    return apiClient.put(`/portfolio/${id}`, { amount, buyPrice });
  },

  removeEntry(id) {
    return apiClient.delete(`/portfolio/${id}`);
  },
};
