const PortfolioService = require('../../services/portfolio.service');
const response = require('../../utils/response');
const Joi = require('joi');

const addCoinSchema = Joi.object({
  coinId: Joi.string().max(100).required(),
  amount: Joi.number().positive().required(),
  buyPrice: Joi.number().positive().required(),
});

const updateCoinSchema = Joi.object({
  amount: Joi.number().positive().required(),
  buyPrice: Joi.number().positive().required(),
});

const PortfolioController = {
  async getPortfolio(req, res, next) {
    try {
      const data = await PortfolioService.getUserPortfolio(req.user.userId);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async addCoin(req, res, next) {
    try {
      const { error: validationError, value } = addCoinSchema.validate(req.body);
      if (validationError) return response.error(res, validationError.details[0].message, 400);
      const data = await PortfolioService.addCoin(req.user.userId, value);
      return response.created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async updateCoin(req, res, next) {
    try {
      const { id } = req.params;
      const { error: validationError, value } = updateCoinSchema.validate(req.body);
      if (validationError) return response.error(res, validationError.details[0].message, 400);
      const data = await PortfolioService.updateCoin(
        parseInt(id, 10),
        req.user.userId,
        value
      );
      if (!data) return response.error(res, 'Portfolio entry not found', 404);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async removeCoin(req, res, next) {
    try {
      const { id } = req.params;
      const data = await PortfolioService.removeCoin(
        parseInt(id, 10),
        req.user.userId
      );
      if (!data) return response.error(res, 'Portfolio entry not found', 404);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = PortfolioController;
