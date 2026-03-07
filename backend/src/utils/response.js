/**
 * Standardized API response helpers.
 * Every response from this API follows the same envelope format.
 */

const success = (res, data, statusCode = 200, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
    timestamp: new Date().toISOString(),
  });
};

const created = (res, data) => {
  return success(res, data, 201);
};

const paginated = (res, data, page, limit, total) => {
  return success(res, data, 200, {
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const error = (res, message, statusCode = 500, errors = null) => {
  const body = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { success, created, paginated, error };
