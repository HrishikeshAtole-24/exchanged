const CoinService = require('../../services/coin.service');
const response = require('../../utils/response');

const CoinController = {
  async getCoinDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await CoinService.getCoinDetails(id);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getCoinMarketChart(req, res, next) {
    try {
      const { id } = req.params;
      const { vs_currency = 'usd', days = 7 } = req.query;
      const data = await CoinService.getCoinMarketChart(id, {
        vsCurrency: vs_currency,
        days: parseInt(days, 10),
      });
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = CoinController;
