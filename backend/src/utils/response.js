/**
 * Standard API Response Helper
 */

const success = (res, message = 'Success', data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

const created = (res, message = 'Created successfully', data = null) => {
  return success(res, message, data, 201);
};

const error = (res, message = 'An error occurred', errors = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors: Array.isArray(errors) ? errors : errors ? [errors] : null,
  });
};

const badRequest = (res, message = 'Bad request', errors = null) => {
  return error(res, message, errors, 400);
};

const unauthorized = (res, message = 'Unauthorized access') => {
  return error(res, message, null, 401);
};

const forbidden = (res, message = 'Forbidden: insufficient privileges') => {
  return error(res, message, null, 403);
};

const notFound = (res, message = 'Resource not found') => {
  return error(res, message, null, 404);
};

const unprocessable = (res, message = 'Unprocessable entity', errors = null) => {
  return error(res, message, errors, 422);
};

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  unprocessable,
};
