/**
 * Global Error Handler Middleware
 * ================================
 * Catches all errors propagated via next(error).
 * Returns consistent error response format.
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map((e) => e.message).join(', ');
  }

  // Sequelize Unique Constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    const field = err.errors[0]?.path || 'field';
    message = `${field} already exists.`;
  }

  // Sequelize Foreign Key Constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referenced resource does not exist.';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} — ${statusCode}: ${message}`, {
      stack: err.stack,
      body: req.body,
      params: req.params,
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Creates an AppError with a custom status code.
 * Usage: throw createError(404, 'Account not found');
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = errorHandler;
module.exports.createError = createError;
