const winston = require('winston');
const env = require('../config/env');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

const logger = winston.createLogger({
  level: env.isDev() ? 'debug' : 'info',
  levels,
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), format),
    }),
  ],
});

module.exports = logger;
