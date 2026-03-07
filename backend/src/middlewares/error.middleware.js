const logger = require('../utils/logger');
const response = require('../utils/response');

/**
 * Global error-handling middleware.
 * Express recognizes 4-param middleware as error handlers.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${statusCode} — ${message}`, { stack: err.stack });

  return response.error(res, message, statusCode);
};

module.exports = errorHandler;
