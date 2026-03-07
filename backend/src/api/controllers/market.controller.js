const MarketService = require('../../services/market.service');
const response = require('../../utils/response');

const MarketController = {
  async getMarkets(req, res, next) {
    try {
      const { vs_currency = 'usd', per_page = 100, page = 1 } = req.query;
      const data = await MarketService.getMarkets({
        vsCurrency: vs_currency,
        perPage: parseInt(per_page, 10),
        page: parseInt(page, 10),
      });
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getTrending(req, res, next) {
    try {
      const data = await MarketService.getTrending();
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getGlobalData(req, res, next) {
    try {
      const data = await MarketService.getGlobalData();
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) return response.error(res, 'Query parameter "q" is required', 400);
      const data = await MarketService.search(q);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = MarketController;
