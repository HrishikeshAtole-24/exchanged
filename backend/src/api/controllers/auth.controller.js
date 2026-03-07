const AuthService = require('../../services/auth.service');
const UserModel = require('../../models/user.model');
const response = require('../../utils/response');
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const AuthController = {
  async register(req, res, next) {
    try {
      const { error: validationError, value } = registerSchema.validate(req.body);
      if (validationError) {
        return response.error(res, validationError.details[0].message, 400);
      }
      const data = await AuthService.register(value.email, value.password);
      return response.created(res, data);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { error: validationError, value } = loginSchema.validate(req.body);
      if (validationError) {
        return response.error(res, validationError.details[0].message, 400);
      }
      const data = await AuthService.login(value.email, value.password);
      return response.success(res, data);
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) return response.error(res, 'User not found', 404);
      return response.success(res, user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
