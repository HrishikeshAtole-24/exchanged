const AlertService = require('../../services/alert.service');
const response = require('../../utils/response');
const Joi = require('joi');

const createAlertSchema = Joi.object({
  coinId: Joi.string().max(100).required(),
  targetPrice: Joi.number().positive().required(),
  direction: Joi.string().valid('above', 'below').required(),
});

const AlertController = {
  async getAlerts(req, res, next) {
    try {
      const data = await AlertService.getUserAlerts(req.user.userId);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async createAlert(req, res, next) {
    try {
      const { error: validationError, value } = createAlertSchema.validate(req.body);
      if (validationError) return response.error(res, validationError.details[0].message, 400);
      const data = await AlertService.createAlert(req.user.userId, value);
      return response.created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async deleteAlert(req, res, next) {
    try {
      const { id } = req.params;
      const data = await AlertService.deleteAlert(
        parseInt(id, 10),
        req.user.userId
      );
      if (!data) return response.error(res, 'Alert not found', 404);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getTriggeredAlerts(req, res, next) {
    try {
      const data = await AlertService.getTriggeredAlerts(req.user.userId);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AlertController;
