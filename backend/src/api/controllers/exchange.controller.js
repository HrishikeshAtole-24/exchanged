const ExchangeService = require('../../services/exchange.service');
const response = require('../../utils/response');

const ExchangeController = {
  async getExchanges(req, res, next) {
    try {
      const { per_page = 100, page = 1 } = req.query;
      const data = await ExchangeService.getExchanges({
        perPage: parseInt(per_page, 10),
        page: parseInt(page, 10),
      });
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getExchangeDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await ExchangeService.getExchangeDetails(id);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ExchangeController;
